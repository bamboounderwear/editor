// colorUtils.js - Utility functions for color handling

/**
 * Get the color value for a CSS class name
 * @param {string} className - The CSS class name (e.g., 'text-primary')
 * @returns {string|null} - The color value or null if not found
 */
function getColorForClass(className) {
  const colorMap = {
    // Text colors
    'text-white': '#ffffff',
    'text-light': '#f8f9fa',
    'text-gray': '#6c757d',
    'text-dark': '#343a40',
    'text-primary': '#007bff',
    'text-secondary': '#6c757d',
    'text-success': '#28a745',
    'text-danger': '#dc3545',
    'text-warning': '#ffc107',
    'text-info': '#17a2b8',
    'text-purple': '#6f42c1',
    'text-pink': '#e83e8c',
    'text-orange': '#fd7e14',
    'text-teal': '#20c997',
    
    // Background colors
    'bg-white': '#ffffff',
    'bg-light': '#f8f9fa',
    'bg-gray': '#6c757d',
    'bg-dark': '#343a40',
    'bg-primary': '#007bff',
    'bg-secondary': '#6c757d',
    'bg-success': '#28a745',
    'bg-danger': '#dc3545',
    'bg-warning': '#ffc107',
    'bg-info': '#17a2b8',
    'bg-purple': '#6f42c1',
    'bg-pink': '#e83e8c',
    'bg-orange': '#fd7e14',
    'bg-teal': '#20c997',
  };
  
  return colorMap[className] || null;
}

/**
 * Convert RGB color to HEX format
 * @param {string} rgbColor - RGB color string (e.g., 'rgb(255, 0, 0)')
 * @returns {string} - HEX color string (e.g., '#ff0000')
 */
function rgbToHex(rgbColor) {
  if (!rgbColor.startsWith('rgb')) return rgbColor;
  
  const rgb = rgbColor.match(/\d+/g);
  if (rgb && rgb.length === 3) {
    return "#" + rgb.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  }
  return rgbColor;
}

/**
 * Validate and format a HEX color string
 * @param {string} hexColor - HEX color string to validate
 * @param {string} defaultColor - Default color to return if invalid
 * @returns {string} - Validated and formatted HEX color
 */
function validateHexColor(hexColor, defaultColor) {
  let value = hexColor;
  
  // Add # prefix if missing
  if (value.charAt(0) !== '#') {
    value = '#' + value;
  }
  
  // Validate hex format
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return value;
  }
  
  return defaultColor;
}

// Export functions for use in other modules
window.colorUtils = {
  getColorForClass,
  rgbToHex,
  validateHexColor
};