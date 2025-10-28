/**
 * File System Abstraction Layer for BOOK COVER PREVIEWER
 *
 * Handles file operations for uploaded cover images and metadata.
 * Designed to work with Railway volume mounts at /data directory.
 */

const DATA_DIR = '/data';
const COVERS_DIR = `${DATA_DIR}/covers`;
const METADATA_FILE = `${DATA_DIR}/metadata.json`;

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
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // Store file data in localStorage (temporary)
        const covers = JSON.parse(localStorage.getItem('bookCoverPreviewer_covers') || '{}');
        covers[fileId] = {
          data: event.target.result,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        };
        localStorage.setItem('bookCoverPreviewer_covers', JSON.stringify(covers));
        resolve(fileId);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Get file data URL by ID
 */
export const getFileDataUrl = (fileId) => {
  try {
    const covers = JSON.parse(localStorage.getItem('bookCoverPreviewer_covers') || '{}');
    return covers[fileId]?.data || null;
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
    const covers = JSON.parse(localStorage.getItem('bookCoverPreviewer_covers') || '{}');
    delete covers[fileId];
    localStorage.setItem('bookCoverPreviewer_covers', JSON.stringify(covers));
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
    localStorage.setItem('bookCoverPreviewer_covers', JSON.stringify({}));
    return true;
  } catch (error) {
    console.error('Failed to clear all files:', error);
    return false;
  }
};

/**
 * Get all stored files info
 */
export const getAllFiles = () => {
  try {
    const covers = JSON.parse(localStorage.getItem('bookCoverPreviewer_covers') || '{}');
    return Object.keys(covers).map(id => ({
      id,
      ...covers[id]
    }));
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
