/* File System Access API - not in lib.dom yet */
interface FileSystemHandle {
  kind: "file" | "directory";
  name: string;
  requestPermission?(options?: { mode?: "read" | "readwrite" }): Promise<PermissionState>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: "directory";
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: "file";
  getFile(): Promise<File>;
}

interface Window {
  showDirectoryPicker?(options?: { mode?: "read" | "readwrite"; startIn?: "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" }): Promise<FileSystemDirectoryHandle>;
}
