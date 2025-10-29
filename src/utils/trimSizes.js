/**
 * Trim Size Management for BOOK COVER PREVIEWER
 *
 * Defines standard book trim sizes and provides validation utilities.
 */

// Essential trim sizes only - we use 4 core sizes in the UI
export const ESSENTIAL_TRIM_SIZES = [
  { width: 4.25, height: 6.87, name: '4.25" × 6.87"', category: 'Fiction' },
  { width: 5.0, height: 8.0, name: '5" × 8"', category: 'Fiction' },
  { width: 6.0, height: 9.0, name: '6" × 9"', category: 'Fiction' },
  { width: 8.5, height: 11.0, name: '8.5" × 11"', category: 'Textbook' }
];

// For backward compatibility with existing code
export const ALL_PRESETS = ESSENTIAL_TRIM_SIZES;

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
