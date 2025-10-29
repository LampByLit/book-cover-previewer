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

    // Start clean with user uploads only

    console.log('✅ Data system initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize data system:', error);
    return false;
  }
};

