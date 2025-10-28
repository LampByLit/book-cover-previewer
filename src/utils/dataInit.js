/**
 * Data Initialization for BOOK COVER PREVIEWER
 *
 * Ensures data storage system is properly initialized on app startup.
 */

import { ensureDataDirectories } from './fileSystem.js';

/**
 * Initialize the data storage system
 * Call this on app startup to ensure everything is ready
 */
export const initializeDataSystem = async () => {
  try {
    console.log('Initializing BOOK COVER PREVIEWER data system...');

    // Ensure directories and basic structure exist
    const directoriesReady = await ensureDataDirectories();
    if (!directoriesReady) {
      throw new Error('Failed to initialize data directories');
    }

    console.log('✅ Data system initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize data system:', error);
    return false;
  }
};

/**
 * Check if data system is ready
 */
export const isDataSystemReady = () => {
  try {
    // Check if localStorage is available (our current storage method)
    if (typeof window === 'undefined') return false;

    // Check if our storage keys exist
    const metadata = localStorage.getItem('bookCoverPreviewer_metadata');
    const covers = localStorage.getItem('bookCoverPreviewer_covers');

    return metadata !== null && covers !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Reset data system (for testing or cleanup)
 */
export const resetDataSystem = async () => {
  try {
    localStorage.removeItem('bookCoverPreviewer_metadata');
    localStorage.removeItem('bookCoverPreviewer_covers');

    const initialized = await initializeDataSystem();
    return initialized;
  } catch (error) {
    console.error('Failed to reset data system:', error);
    return false;
  }
};

/**
 * Get data system status
 */
export const getDataSystemStatus = () => {
  return {
    ready: isDataSystemReady(),
    storageType: 'localStorage', // Will be 'railway-volume' in production
    version: '1.0.0'
  };
};
