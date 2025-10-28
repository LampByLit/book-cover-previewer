/**
 * Trim Size Management for BOOK COVER PREVIEWER
 *
 * Defines standard book trim sizes and provides validation utilities.
 */

// Preset trim sizes organized by category
export const TRIM_SIZE_PRESETS = {
  fiction: [
    { width: 4.25, height: 6.87, name: 'Fiction 1', category: 'Fiction' },
    { width: 5.0, height: 8.0, name: 'Fiction 2', category: 'Fiction' },
    { width: 5.25, height: 8.0, name: 'Fiction 3', category: 'Fiction' },
    { width: 5.5, height: 8.5, name: 'Fiction 4', category: 'Fiction' },
    { width: 6.0, height: 9.0, name: 'Fiction 5', category: 'Fiction' }
  ],
  children: [
    { width: 7.5, height: 7.5, name: 'Children 1', category: 'Children\'s' },
    { width: 7.0, height: 10.0, name: 'Children 2', category: 'Children\'s' },
    { width: 10.0, height: 8.0, name: 'Children 3', category: 'Children\'s' }
  ],
  textbooks: [
    { width: 6.0, height: 9.0, name: 'Textbook 1', category: 'Textbooks' },
    { width: 7.0, height: 10.0, name: 'Textbook 2', category: 'Textbooks' },
    { width: 8.5, height: 11.0, name: 'Textbook 3', category: 'Textbooks' }
  ],
  nonfiction: [
    { width: 5.5, height: 8.5, name: 'Non-fiction 1', category: 'Non-fiction' },
    { width: 6.0, height: 9.0, name: 'Non-fiction 2', category: 'Non-fiction' },
    { width: 7.0, height: 10.0, name: 'Non-fiction 3', category: 'Non-fiction' }
  ],
  memoir: [
    { width: 5.25, height: 8.0, name: 'Memoir 1', category: 'Memoir' },
    { width: 5.5, height: 8.5, name: 'Memoir 2', category: 'Memoir' }
  ]
};

// Flatten all presets for easy access
export const ALL_PRESETS = Object.values(TRIM_SIZE_PRESETS).flat();

// Validation constants
export const TRIM_SIZE_LIMITS = {
  MIN_WIDTH: 0.1,
  MAX_WIDTH: 20.0,
  MIN_HEIGHT: 0.1,
  MAX_HEIGHT: 20.0,
  DECIMAL_PLACES: 4
};

/**
 * Validate custom trim size dimensions
 */
export const validateTrimSize = (width, height) => {
  const errors = [];

  // Check if values are numbers
  if (isNaN(width) || isNaN(height)) {
    errors.push('Width and height must be valid numbers');
    return { valid: false, errors };
  }

  // Check decimal places
  const widthDecimals = (width.toString().split('.')[1] || '').length;
  const heightDecimals = (height.toString().split('.')[1] || '').length;

  if (widthDecimals > TRIM_SIZE_LIMITS.DECIMAL_PLACES) {
    errors.push(`Width can have at most ${TRIM_SIZE_LIMITS.DECIMAL_PLACES} decimal places`);
  }

  if (heightDecimals > TRIM_SIZE_LIMITS.DECIMAL_PLACES) {
    errors.push(`Height can have at most ${TRIM_SIZE_LIMITS.DECIMAL_PLACES} decimal places`);
  }

  // Check range limits
  if (width < TRIM_SIZE_LIMITS.MIN_WIDTH || width > TRIM_SIZE_LIMITS.MAX_WIDTH) {
    errors.push(`Width must be between ${TRIM_SIZE_LIMITS.MIN_WIDTH}" and ${TRIM_SIZE_LIMITS.MAX_WIDTH}"`);
  }

  if (height < TRIM_SIZE_LIMITS.MIN_HEIGHT || height > TRIM_SIZE_LIMITS.MAX_HEIGHT) {
    errors.push(`Height must be between ${TRIM_SIZE_LIMITS.MIN_HEIGHT}" and ${TRIM_SIZE_LIMITS.MAX_HEIGHT}"`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get preset by dimensions (for reverse lookup)
 */
export const findPresetByDimensions = (width, height, tolerance = 0.01) => {
  return ALL_PRESETS.find(preset =>
    Math.abs(preset.width - width) <= tolerance &&
    Math.abs(preset.height - height) <= tolerance
  );
};

/**
 * Format trim size for display
 */
export const formatTrimSize = (width, height) => {
  return `${width}" × ${height}"`;
};

/**
 * Get all categories
 */
export const getCategories = () => {
  return Object.keys(TRIM_SIZE_PRESETS);
};

/**
 * Get presets for a specific category
 */
export const getPresetsByCategory = (category) => {
  return TRIM_SIZE_PRESETS[category] || [];
};

/**
 * Calculate spine width from image dimensions and trim size
 * Assumes image format: [front cover][spine][back cover]
 */
export const calculateSpineWidth = (imageWidth, trimWidth) => {
  // Spine width = total_image_width - (2 × trim_width)
  // This gives us the width of the spine content in the image
  return Math.max(0, imageWidth - (2 * trimWidth));
};

/**
 * Convert inches to 3D units (using 0.2 units per inch scale)
 */
export const inchesToUnits = (inches) => {
  return inches * 0.2;
};

/**
 * Convert 3D units to inches
 */
export const unitsToInches = (units) => {
  return units / 0.2;
};
