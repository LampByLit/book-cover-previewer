/**
 * File System Abstraction Layer for BOOK COVER PREVIEWER
 *
 * Handles file operations for uploaded cover images and metadata.
 * Designed to work with Railway volume mounts at /data directory.
 */

const DATA_DIR = '/data';
const COVERS_DIR = `${DATA_DIR}/covers`;
const METADATA_FILE = `${DATA_DIR}/metadata.json`;

// IndexedDB configuration for storing uploaded image data
const IDB_NAME = 'bookCoverPreviewerDB';
const IDB_VERSION = 1;
const IDB_STORE_COVERS = 'covers';

const openIdb = () => {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not available'));
    }
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE_COVERS)) {
        db.createObjectStore(IDB_STORE_COVERS, { keyPath: 'id' });
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const idbPutCover = async (record) => {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_COVERS, 'readwrite');
    const store = tx.objectStore(IDB_STORE_COVERS);
    const req = store.put(record);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(true);
  });
};

const idbGetCover = async (id) => {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_COVERS, 'readonly');
    const store = tx.objectStore(IDB_STORE_COVERS);
    const req = store.get(id);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result || null);
  });
};

const idbDeleteCover = async (id) => {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_COVERS, 'readwrite');
    const store = tx.objectStore(IDB_STORE_COVERS);
    const req = store.delete(id);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(true);
  });
};

/**
 * Ensure data directories exist
 */
export const ensureDataDirectories = async () => {
  try {
    // For now, we'll use localStorage as a placeholder
    // In production with Railway volumes, this will use actual file system
    if (typeof window !== 'undefined') {
      // Initialize localStorage structure
      if (!localStorage.getItem('bookCoverPreviewer_metadata')) {
        localStorage.setItem('bookCoverPreviewer_metadata', JSON.stringify([]));
      }
      if (!localStorage.getItem('bookCoverPreviewer_covers')) {
        localStorage.setItem('bookCoverPreviewer_covers', JSON.stringify({}));
      }
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize data directories:', error);
    return false;
  }
};

/**
 * Generate unique ID for uploaded files
 */
export const generateFileId = () => {
  return `cover_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Save uploaded file (placeholder - will be replaced with actual file system)
 */
export const saveUploadedFile = async (file, fileId) => {
  // Compress large images to reduce storage size
  const dataUrl = await readFileAsCompressedDataUrl(file);
  const record = {
    id: fileId,
    data: dataUrl,
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString()
  };
  await idbPutCover(record);
  return fileId;
};

const readFileAsCompressedDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxDim = 3000; // cap large images to reduce storage usage
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const scale = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          // Prefer WebP for better compression when supported, else JPEG
          const mime = 'image/webp';
          const quality = 0.9;
          const out = canvas.toDataURL(mime, quality);
          resolve(out);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Get file data URL by ID
 */
export const getFileDataUrl = async (fileId) => {
  try {
    const record = await idbGetCover(fileId);
    return record?.data || null;
  } catch (error) {
    console.error('Failed to get file data:', error);
    return null;
  }
};

/**
 * Delete file by ID
 */
export const deleteFile = async (fileId) => {
  try {
    await idbDeleteCover(fileId);
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
};

/**
 * Clear all files
 */
export const clearAllFiles = async () => {
  try {
    const db = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_COVERS, 'readwrite');
      const store = tx.objectStore(IDB_STORE_COVERS);
      const req = store.clear();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(true);
    });
  } catch (error) {
    console.error('Failed to clear all files:', error);
    return false;
  }
};

/**
 * Get all stored files info
 */
export const getAllFiles = async () => {
  try {
    const db = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_COVERS, 'readonly');
      const store = tx.objectStore(IDB_STORE_COVERS);
      const req = store.getAll();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result || []);
    });
  } catch (error) {
    console.error('Failed to get all files:', error);
    return [];
  }
};

/**
 * Save metadata
 */
export const saveMetadata = async (metadata) => {
  try {
    localStorage.setItem('bookCoverPreviewer_metadata', JSON.stringify(metadata));
    return true;
  } catch (error) {
    console.error('Failed to save metadata:', error);
    return false;
  }
};

/**
 * Load metadata
 */
export const loadMetadata = () => {
  try {
    return JSON.parse(localStorage.getItem('bookCoverPreviewer_metadata') || '[]');
  } catch (error) {
    console.error('Failed to load metadata:', error);
    return [];
  }
};

/**
 * Validate file before upload
 */
export const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File must be PNG, JPG, JPEG, or WebP' };
  }

  return { valid: true };
};
