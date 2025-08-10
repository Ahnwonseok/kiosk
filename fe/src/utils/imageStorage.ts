// Utilities to persist a directory handle and save/load images locally using the File System Access API (Chromium only)

const DB_NAME = 'menu-admin';
const STORE_NAME = 'fs-handles';
const KEY_DIR = 'imageDir';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: any): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet<T = any>(key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function selectAndStoreImageDirectory(): Promise<FileSystemDirectoryHandle | null> {
  // @ts-ignore
  if (!window.showDirectoryPicker) return null;
  try {
    // @ts-ignore
    const dir: FileSystemDirectoryHandle = await window.showDirectoryPicker();
    await idbSet(KEY_DIR, dir);
    return dir;
  } catch {
    return null;
  }
}

export async function getStoredImageDirectory(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = (await idbGet(KEY_DIR)) as FileSystemDirectoryHandle | undefined;
    if (!handle) return null;
    // @ts-ignore
    const perm = await (handle as any).queryPermission?.({ mode: 'readwrite' });
    if (perm !== 'granted') {
      // @ts-ignore
      const req = await (handle as any).requestPermission?.({ mode: 'readwrite' });
      if (req !== 'granted') return null;
    }
    return handle;
  } catch {
    return null;
  }
}

export async function saveFileToStoredDirectory(file: File): Promise<boolean> {
  const dir = await getStoredImageDirectory();
  if (!dir) return false;
  try {
    // @ts-ignore
    const fileHandle = await (dir as any).getFileHandle(file.name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(await file.arrayBuffer());
    await writable.close();
    return true;
  } catch {
    return false;
  }
}

export async function resolveImageUrlFromStoredDirectory(imgPath: string): Promise<string | null> {
  // Expecting paths like '/assets/image/filename.png'
  const parts = imgPath.split('/');
  const fileName = parts[parts.length - 1];
  const dir = await getStoredImageDirectory();
  if (!dir) return null;
  try {
    // @ts-ignore
    const fileHandle = await (dir as any).getFileHandle(fileName, { create: false });
    const file = await fileHandle.getFile();
    return URL.createObjectURL(file);
  } catch {
    return null;
  }
}

