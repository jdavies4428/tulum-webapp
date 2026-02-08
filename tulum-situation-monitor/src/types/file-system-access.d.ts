/* File System Access API - not in lib.dom yet */
interface FileSystemDirectoryHandle {
  kind: "directory";
  name: string;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>;
}

interface FileSystemFileHandle {
  kind: "file";
  name: string;
  getFile(): Promise<File>;
}

interface Window {
  showDirectoryPicker?(options?: { mode?: "read" | "readwrite"; startIn?: "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" }): Promise<FileSystemDirectoryHandle>;
}
