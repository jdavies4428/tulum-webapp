import exifr from "exifr";
import { haversineKm } from "@/data/constants";

export const TULUM_BOUNDS = {
  north: 20.25,
  south: 20.15,
  east: -87.42,
  west: -87.52,
};

export function isInTulum(lat: number, lng: number): boolean {
  return (
    lat >= TULUM_BOUNDS.south &&
    lat <= TULUM_BOUNDS.north &&
    lng >= TULUM_BOUNDS.west &&
    lng <= TULUM_BOUNDS.east
  );
}

export interface PhotoWithGPS {
  id: string;
  filename: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  file: File;
}

export interface PhotoCluster {
  id: string;
  latitude: number;
  longitude: number;
  photos: PhotoWithGPS[];
}

const CLUSTER_RADIUS_KM = 0.1;

export async function readPhotoGPS(file: File): Promise<PhotoWithGPS | null> {
  try {
    const gps = await exifr.gps(file);
    if (!gps || typeof gps.latitude !== "number" || typeof gps.longitude !== "number") {
      return null;
    }
    const meta = await exifr.parse(file, { pick: ["DateTimeOriginal", "CreateDate"] });
    const timestamp = meta?.DateTimeOriginal || meta?.CreateDate
      ? new Date(meta.DateTimeOriginal || meta.CreateDate)
      : new Date();

    return {
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      filename: file.name,
      imageUrl: URL.createObjectURL(file),
      latitude: gps.latitude,
      longitude: gps.longitude,
      timestamp: timestamp instanceof Date ? timestamp : new Date(timestamp),
      file,
    };
  } catch {
    return null;
  }
}

export function clusterPhotosByLocation(photos: PhotoWithGPS[]): PhotoCluster[] {
  const clusters: PhotoCluster[] = [];
  const processed = new Set<string>();

  for (const photo of photos) {
    if (processed.has(photo.id)) continue;

    const cluster: PhotoCluster = {
      id: `cluster-${Math.random().toString(36).slice(2)}`,
      latitude: photo.latitude,
      longitude: photo.longitude,
      photos: [photo],
    };
    processed.add(photo.id);

    for (const other of photos) {
      if (processed.has(other.id) || other.id === photo.id) continue;

      const distance = haversineKm(
        photo.latitude,
        photo.longitude,
        other.latitude,
        other.longitude
      );

      if (distance < CLUSTER_RADIUS_KM) {
        cluster.photos.push(other);
        processed.add(other.id);
      }
    }

    const avgLat =
      cluster.photos.reduce((s, p) => s + p.latitude, 0) / cluster.photos.length;
    const avgLng =
      cluster.photos.reduce((s, p) => s + p.longitude, 0) / cluster.photos.length;
    cluster.latitude = avgLat;
    cluster.longitude = avgLng;

    clusters.push(cluster);
  }

  return clusters;
}

export async function getAllFilesFromDirHandle(
  dirHandle: FileSystemDirectoryHandle,
  fileList: File[] = []
): Promise<File[]> {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === "file") {
      const file = await entry.getFile();
      if (file.type.startsWith("image/")) {
        fileList.push(file);
      }
    } else if (entry.kind === "directory") {
      await getAllFilesFromDirHandle(entry as FileSystemDirectoryHandle, fileList);
    }
  }
  return fileList;
}

export function supportsDirectoryPicker(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

const PHOTO_MAP_DB = "photo-map-db";
const PHOTO_MAP_STORE = "dir-handle";
const DIR_HANDLE_KEY = "photos";

export async function getStoredDirHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return null;
  return new Promise((resolve) => {
    const req = indexedDB.open(PHOTO_MAP_DB, 1);
    req.onerror = () => resolve(null);
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PHOTO_MAP_STORE)) {
        db.close();
        resolve(null);
        return;
      }
      const tx = db.transaction(PHOTO_MAP_STORE, "readonly");
      const store = tx.objectStore(PHOTO_MAP_STORE);
      const getReq = store.get(DIR_HANDLE_KEY);
      getReq.onerror = () => resolve(null);
      getReq.onsuccess = () => {
        const handle = getReq.result as FileSystemDirectoryHandle | undefined;
        resolve(handle ?? null);
      };
    };
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PHOTO_MAP_STORE)) {
        db.createObjectStore(PHOTO_MAP_STORE);
      }
    };
  });
}

export async function saveDirHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PHOTO_MAP_DB, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(PHOTO_MAP_STORE, "readwrite");
      const store = tx.objectStore(PHOTO_MAP_STORE);
      store.put(handle, DIR_HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PHOTO_MAP_STORE)) {
        db.createObjectStore(PHOTO_MAP_STORE);
      }
    };
  });
}

export async function clearStoredDirHandle(): Promise<void> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return;
  return new Promise((resolve) => {
    const req = indexedDB.open(PHOTO_MAP_DB, 1);
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PHOTO_MAP_STORE)) {
        db.close();
        resolve();
        return;
      }
      const tx = db.transaction(PHOTO_MAP_STORE, "readwrite");
      const store = tx.objectStore(PHOTO_MAP_STORE);
      store.delete(DIR_HANDLE_KEY);
      tx.oncomplete = () => resolve();
    };
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PHOTO_MAP_STORE)) {
        db.createObjectStore(PHOTO_MAP_STORE);
      }
    };
  });
}
