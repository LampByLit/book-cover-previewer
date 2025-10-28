/**
 * Cover Data Management for BOOK COVER PREVIEWER
 *
 * Manages cover metadata, CRUD operations, and data persistence.
 */

import { loadMetadata, saveMetadata, generateFileId } from './fileSystem.js';
import { findPresetByDimensions, formatTrimSize } from './trimSizes.js';

/**
 * Cover data structure:
 * {
 *   id: string,
 *   filename: string,
 *   originalName: string,
 *   trimSize: { width: number, height: number },
 *   uploadedAt: string (ISO date),
 *   fileSize: number,
 *   imageDimensions: { width: number, height: number } (optional)
 * }
 */

/**
 * Get all covers
 */
export const getAllCovers = () => {
  return loadMetadata();
};

/**
 * Get cover by ID
 */
export const getCoverById = (id) => {
  const covers = getAllCovers();
  return covers.find(cover => cover.id === id);
};

/**
 * Add new cover
 */
export const addCover = async (file, trimSize) => {
  const covers = getAllCovers();
  const id = generateFileId();

  const newCover = {
    id,
    filename: `${id}.png`, // We'll convert to PNG for consistency
    originalName: file.name,
    trimSize: {
      width: parseFloat(trimSize.width),
      height: parseFloat(trimSize.height)
    },
    uploadedAt: new Date().toISOString(),
    fileSize: file.size
  };

  covers.push(newCover);
  await saveMetadata(covers);

  return newCover;
};

/**
 * Update cover metadata
 */
export const updateCover = async (id, updates) => {
  const covers = getAllCovers();
  const index = covers.findIndex(cover => cover.id === id);

  if (index === -1) {
    throw new Error('Cover not found');
  }

  covers[index] = { ...covers[index], ...updates };
  await saveMetadata(covers);

  return covers[index];
};

/**
 * Delete cover
 */
export const deleteCover = async (id) => {
  const covers = getAllCovers();
  const filteredCovers = covers.filter(cover => cover.id !== id);

  if (filteredCovers.length === covers.length) {
    throw new Error('Cover not found');
  }

  await saveMetadata(filteredCovers);
  return true;
};

/**
 * Clear all covers
 */
export const clearAllCovers = async () => {
  await saveMetadata([]);
  return true;
};

/**
 * Get cover display info
 */
export const getCoverDisplayInfo = (cover) => {
  const preset = findPresetByDimensions(cover.trimSize.width, cover.trimSize.height);

  return {
    ...cover,
    displayName: cover.originalName,
    trimSizeDisplay: formatTrimSize(cover.trimSize.width, cover.trimSize.height),
    presetName: preset?.name || 'Custom',
    category: preset?.category || 'Custom',
    uploadedDate: new Date(cover.uploadedAt).toLocaleDateString(),
    fileSizeDisplay: formatFileSize(cover.fileSize)
  };
};

/**
 * Format file size for display
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate cover data
 */
export const validateCoverData = (data) => {
  const errors = [];

  if (!data.id) errors.push('ID is required');
  if (!data.filename) errors.push('Filename is required');
  if (!data.trimSize) errors.push('Trim size is required');
  if (!data.trimSize.width || !data.trimSize.height) errors.push('Trim size dimensions are required');
  if (!data.uploadedAt) errors.push('Upload date is required');

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get covers by category
 */
export const getCoversByCategory = (category) => {
  const covers = getAllCovers();
  return covers.filter(cover => {
    const preset = findPresetByDimensions(cover.trimSize.width, cover.trimSize.height);
    return preset?.category === category;
  });
};

/**
 * Search covers by name or trim size
 */
export const searchCovers = (query) => {
  if (!query) return getAllCovers();

  const covers = getAllCovers();
  const lowercaseQuery = query.toLowerCase();

  return covers.filter(cover => {
    const displayInfo = getCoverDisplayInfo(cover);
    return (
      displayInfo.displayName.toLowerCase().includes(lowercaseQuery) ||
      displayInfo.trimSizeDisplay.includes(query) ||
      displayInfo.presetName.toLowerCase().includes(lowercaseQuery) ||
      displayInfo.category.toLowerCase().includes(lowercaseQuery)
    );
  });
};

/**
 * Get cover statistics
 */
export const getCoverStats = () => {
  const covers = getAllCovers();
  const totalSize = covers.reduce((sum, cover) => sum + (cover.fileSize || 0), 0);
  const categories = {};

  covers.forEach(cover => {
    const preset = findPresetByDimensions(cover.trimSize.width, cover.trimSize.height);
    const category = preset?.category || 'Custom';
    categories[category] = (categories[category] || 0) + 1;
  });

  return {
    totalCovers: covers.length,
    totalSize,
    totalSizeDisplay: formatFileSize(totalSize),
    categories,
    lastUpload: covers.length > 0 ? new Date(Math.max(...covers.map(c => new Date(c.uploadedAt)))) : null
  };
};
