// styleUtils.js - Utility functions for styling elements

/**
 * Apply a text color to an element
 * @param {HTMLElement} element - The element to style
 * @param {string} colorValue - The color value or class name
 */
function applyTextColor(element, colorValue) {
  // Remove existing text color classes
  element.classList.forEach(cls => {
    if (cls.startsWith("text-")) {
      element.classList.remove(cls);
    }
  });
  
  // Clear any inline color style
  element.style.color = '';
  
  // Apply the selected color
  if (colorValue === "custom") {
    // Custom color should be handled by the caller
    return;
  } else if (colorValue) {
    // Apply predefined color class
    element.classList.add(colorValue);
  }
}

/**
 * Apply a background color to an element
 * @param {HTMLElement} element - The element to style
 * @param {string} colorValue - The color value or class name
 */
function applyBackgroundColor(element, colorValue) {
  // Remove existing background color classes
  element.classList.forEach(cls => {
    if (cls.startsWith("bg-")) {
      element.classList.remove(cls);
    }
  });
  
  // Clear any inline background color style
  element.style.backgroundColor = '';
  
  // Apply the selected color
  if (colorValue === "custom") {
    // Custom color should be handled by the caller
    return;
  } else if (colorValue) {
    // Apply predefined color class
    element.classList.add(colorValue);
  }
}

/**
 * Apply size classes to an h1 element
 * @param {HTMLElement} element - The h1 element to style
 * @param {string} sizeClass - The size class to apply
 */
function applyHeadingSize(element, sizeClass) {
  if (element.tagName.toLowerCase() !== "h1") return;
  
  // Remove existing size classes
  element.classList.remove("large", "xlarge", "xxlarge", "xxxlarge");
  
  // Apply new size class if provided
  if (sizeClass) {
    element.classList.add(sizeClass);
  }
}

/**
 * Apply text alignment to an element
 * @param {HTMLElement} element - The element to style
 * @param {string} alignment - The alignment value (left, center, right)
 */
function applyTextAlignment(element, alignment) {
  // Remove existing alignment classes
  element.classList.remove("left", "center", "right");
  
  // Apply new alignment if provided
  if (alignment) {
    element.classList.add(alignment);
  }
}

/**
 * Apply cell text alignment
 * @param {HTMLElement} cell - The ```
 * Apply cell text alignment
 * @param {HTMLElement} cell - The cell to style
 * @param {string} alignment - The alignment value (text-left, text-center, text-right)
 */
function applyCellTextAlignment(cell, alignment) {
  // Remove existing text alignment classes
  cell.classList.remove("text-left", "text-center", "text-right");
  
  // Apply new alignment if provided
  if (alignment) {
    cell.classList.add(alignment);
  }
}

/**
 * Apply spacing classes (margin, padding) to an element
 * @param {HTMLElement} element - The element to style
 * @param {string} marginClass - The margin class to apply
 * @param {string} paddingClass - The padding class to apply
 */
function applySpacing(element, marginClass, paddingClass) {
  // Remove existing margin and padding classes
  element.classList.forEach(cls => {
    if (cls.startsWith("margin") || cls.startsWith("padding")) {
      element.classList.remove(cls);
    }
  });
  
  // Apply new classes if provided
  if (marginClass) element.classList.add(marginClass);
  if (paddingClass) element.classList.add(paddingClass);
}

/**
 * Apply content alignment to a cell
 * @param {HTMLElement} cell - The cell to style
 * @param {string} alignment - The alignment value (align-top, align-middle, align-bottom)
 */
function applyCellContentAlignment(cell, alignment) {
  // Remove existing alignment classes
  cell.classList.remove("align-top", "align-middle", "align-bottom");
  
  // Apply new alignment if provided
  if (alignment) {
    cell.classList.add(alignment);
  }
}

/**
 * Apply height class to a cell
 * @param {HTMLElement} cell - The cell to style
 * @param {string} heightClass - The height class to apply (h-1, h-2, etc.)
 */
function applyCellHeight(cell, heightClass) {
  // Remove existing height classes
  for (let i = 1; i <= 40; i++) {
    cell.classList.remove(`h-${i}`);
  }
  
  // Add new height class if selected
  if (heightClass) {
    cell.classList.add(heightClass);
  }
}

// Export functions for use in other modules
window.styleUtils = {
  applyTextColor,
  applyBackgroundColor,
  applyHeadingSize,
  applyTextAlignment,
  applySpacing,
  applyCellContentAlignment,
  applyCellHeight,
  applyCellTextAlignment
};