// exportUtils.js - Utility functions for exporting layouts

/**
 * Generate CSS for color classes used in the document
 * @param {Array} colorClasses - Array of color class names
 * @param {Object} pageStyles - Page styling settings
 * @returns {string} - Generated CSS
 */
function generateColorStyles(colorClasses, pageStyles) {
  let colorStyles = '<style>\n';
  
  // Add color definitions for classes
  colorClasses.forEach(cls => {
    if (cls.startsWith('text-') || cls.startsWith('bg-')) {
      const color = window.colorUtils.getColorForClass(cls);
      if (color) {
        if (cls.startsWith('text-')) {
          colorStyles += `  .${cls} { color: ${color}; }\n`;
        } else if (cls.startsWith('bg-')) {
          colorStyles += `  .${cls} { background-color: ${color}; }\n`;
        }
      }
    }
  });
  
  // Add custom colors if used
  if (pageStyles && pageStyles.backgroundColor === "custom") {
    colorStyles += `  body { background-color: ${pageStyles.customBgColor}; }\n`;
  }
  
  if (pageStyles && pageStyles.textColor === "custom") {
    colorStyles += `  body { color: ${pageStyles.customTextColor}; }\n`;
  }
  
  // Add min-height style for the body
  colorStyles += '  body { min-height: calc(100vh - 60px); }\n';
  
  // Add custom element styles
  colorStyles += '  [style*="color:"] { color: var(--custom-color, inherit); }\n';
  colorStyles += '  [style*="background-color:"] { background-color: var(--custom-bg-color, inherit); }\n';
  
  // Add text alignment styles
  colorStyles += '  .text-left { text-align: left; }\n';
  colorStyles += '  .text-center { text-align: center; }\n';
  colorStyles += '  .text-right { text-align: right; }\n';
  
  // Add button styling
  colorStyles += '  button {\n';
  colorStyles += '    padding: 8px 16px;\n';
  colorStyles += '    background-color: #000000;\n';
  colorStyles += '    color: white;\n';
  colorStyles += '    border: none;\n';
  colorStyles += '    border-radius: 0px;\n';
  colorStyles += '    cursor: pointer;\n';
  colorStyles += '    font-size: 1rem;\n';
  colorStyles += '    font-weight: 500;\n';
  colorStyles += '  }\n';
  
  colorStyles += '</style>\n';
  
  return colorStyles;
}

/**
 * Generate CSS for font and container styles
 * @param {Object} pageStyles - Page styling settings
 * @returns {string} - Generated CSS
 */
function generateFontAndContainerStyles(pageStyles) {
  if (!pageStyles) return '';
  
  let styles = '<style>\n';
  
  // Font size
  if (pageStyles.fontSize) {
    const fontSize = pageStyles.fontSize.replace('font-size-', '');
    let fontSizeValue = '12px'; // Default
    
    switch (fontSize) {
      case 'small':
        fontSizeValue = '10px';
        break;
      case 'medium':
        fontSizeValue = '12px';
        break;
      case 'large':
        fontSizeValue = '14px';
        break;
      case 'xlarge':
        fontSizeValue = '16px';
        break;
    }
    
    styles += `  :root { --fontSize: ${fontSizeValue}; }\n`;
  }
  
  // Heading font family
  if (pageStyles.headingFont) {
    const headingFont = pageStyles.headingFont.replace('heading-font-', '');
    let headingFontValue = '"Inter", sans-serif'; // Default
    
    switch (headingFont) {
      case 'inter':
        headingFontValue = '"Inter", sans-serif';
        break;
      case 'lora':
        headingFontValue = '"Lora", serif';
        break;
      case 'poppins':
        headingFontValue = '"Poppins", sans-serif';
        break;
      case 'oswald':
        headingFontValue = '"Oswald", sans-serif';
        break;
    }
    
    styles += `  h1, h2, h3, h4, h5, h6 { font-family: ${headingFontValue}; }\n`;
  }
  
  // Heading font weight
  if (pageStyles.headingWeight) {
    const headingWeight = pageStyles.headingWeight.replace('heading-weight-', '');
    let headingWeightValue = '700'; // Default
    
    switch (headingWeight) {
      case 'light':
        headingWeightValue = '300';
        break;
      case 'normal':
        headingWeightValue = '400';
        break;
      case 'medium':
        headingWeightValue = '500';
        break;
      case 'semibold':
        headingWeightValue = '600';
        break;
      case 'bold':
        headingWeightValue = '700';
        break;
    }
    
    styles += `  h1, h2, h3, h4, h5, h6 { font-weight: ${headingWeightValue}; }\n`;
  }
  
  // Body font family
  if (pageStyles.bodyFont) {
    const bodyFont = pageStyles.bodyFont.replace('body-font-', '');
    let bodyFontValue = '"Inter", sans-serif'; // Default
    
    switch (bodyFont) {
      case 'inter':
        bodyFontValue = '"Inter", sans-serif';
        break;
      case 'lora':
        bodyFontValue = '"Lora", serif';
        break;
      case 'poppins':
        bodyFontValue = '"Poppins", sans-serif';
        break;
      case 'oswald':
        bodyFontValue = '"Oswald", sans-serif';
        break;
    }
    
    styles += `  body { font-family: ${bodyFontValue}; }\n`;
  }
  
  // Body font weight
  if (pageStyles.bodyWeight) {
    const bodyWeight = pageStyles.bodyWeight.replace('body-weight-', '');
    let bodyWeightValue = '400'; // Default
    
    switch (bodyWeight) {
      case 'light':
        bodyWeightValue = '300';
        break;
      case 'normal':
        bodyWeightValue = '400';
        break;
      case 'medium':
        bodyWeightValue = '500';
        break;
      case 'semibold':
        bodyWeightValue = '600';
        break;
      case 'bold':
        bodyWeightValue = '700';
        break;
    }
    
    styles += `  body { font-weight: ${bodyWeightValue}; }\n`;
  }
  
  // Container width
  if (pageStyles.containerWidth) {
    const containerWidth = pageStyles.containerWidth.replace('container-', '');
    let containerWidthValue = 'none'; // Default (fluid)
    
    switch (containerWidth) {
      case 'fluid':
        containerWidthValue = 'none';
        break;
      case 'xl':
        containerWidthValue = '1200px';
        break;
      case 'lg':
        containerWidthValue = '992px';
        break;
      case 'md':
        containerWidthValue = '768px';
        break;
      case 'sm':
        containerWidthValue = '576px';
        break;
    }
    
    if (containerWidthValue !== 'none') {
      styles += `  body > * { max-width: ${containerWidthValue}; margin-left: auto; margin-right: auto; }\n`;
    }
  }
  
  styles += '</style>\n';
  
  return styles;
}

/**
 * Generate Google Fonts links based on selected fonts
 * @param {Object} pageStyles - Page styling settings
 * @returns {string} - Generated Google Fonts links
 */
function generateGoogleFontsLinks(pageStyles) {
  if (!pageStyles) return '';
  
  let googleFontsLinks = '';
  const fontsToInclude = new Set();
  
  // Check heading font
  if (pageStyles.headingFont && pageStyles.headingFont !== 'heading-font-inter') {
    const fontName = pageStyles.headingFont.replace('heading-font-', '');
    fontsToInclude.add(fontName);
  }
  
  // Check body font
  if (pageStyles.bodyFont && pageStyles.bodyFont !== 'body-font-inter') {
    const fontName = pageStyles.bodyFont.replace('body-font-', '');
    fontsToInclude.add(fontName);
  }
  
  // Generate Google Fonts links
  fontsToInclude.forEach(font => {
    const formattedFont = font.charAt(0).toUpperCase() + font.slice(1);
    googleFontsLinks += `  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${formattedFont}:wght@300;400;500;600;700&display=swap">\n`;
  });
  
  return googleFontsLinks;
}

/**
 * Process inline styles for elements
 * @param {HTMLElement} element - The element to process
 */
function processInlineStyles(element) {
  // Convert inline styles to custom properties for better handling in the exported CSS
  if (element.style.color) {
    element.setAttribute('style', `--custom-color: ${element.style.color};`);
  }
  if (element.style.backgroundColor) {
    element.setAttribute('style', `--custom-bg-color: ${element.style.backgroundColor};`);
  }
}

/**
 * Extract all color classes used in the document
 * @param {HTMLElement} rootElement - The root element to search in
 * @param {Object} pageStyles - Page styling settings
 * @returns {Array} - Array of color class names
 */
function extractColorClasses(rootElement, pageStyles) {
  const colorClasses = [];
  const textColorRegex = /text-[a-z]+/;
  const bgColorRegex = /bg-[a-z]+/;
  
  // Check for text color classes
  rootElement.querySelectorAll('*').forEach(el => {
    el.classList.forEach(cls => {
      if (textColorRegex.test(cls) || bgColorRegex.test(cls)) {
        if (!colorClasses.includes(cls)) {
          colorClasses.push(cls);
        }
      }
    });
  });
  
  // Add page-level color classes if they exist
  if (pageStyles && pageStyles.backgroundColor && pageStyles.backgroundColor !== "custom") {
    if (!colorClasses.includes(pageStyles.backgroundColor)) {
      colorClasses.push(pageStyles.backgroundColor);
    }
  }
  
  if (pageStyles && pageStyles.textColor && pageStyles.textColor !== "custom") {
    if (!colorClasses.includes(pageStyles.textColor)) {
      colorClasses.push(pageStyles.textColor);
    }
  }
  
  return colorClasses;
}

/**
 * Clean up elements for export
 * @param {HTMLElement} element - The element to clean
 */
function cleanupElement(element) {
  element.classList.remove('editable-element');
  element.classList.remove('selected-element');
  element.removeAttribute('data-id');
}

/**
 * Clean up a grid for export
 * @param {HTMLElement} grid - The grid to clean
 */
function cleanupGrid(grid) {
  grid.classList.remove('debug');
  grid.classList.remove('selected');
  grid.classList.remove('grid-container');
  grid.classList.remove('show-base-grid');
  grid.removeAttribute('data-id');
}

/**
 * Clean up a cell for export
 * @param {HTMLElement} cell - The cell to clean
 */
function cleanupCell(cell) {
  cell.classList.remove('selected');
  cell.classList.remove('cell');
  cell.removeAttribute('data-id');
  // Remove the temporary inline padding style
  cell.style.padding = '';
}

// Export functions for use in other modules
window.exportUtils = {
  generateColorStyles,
  generateFontAndContainerStyles,
  generateGoogleFontsLinks,
  processInlineStyles,
  extractColorClasses,
  cleanupElement,
  cleanupGrid,
  cleanupCell
};