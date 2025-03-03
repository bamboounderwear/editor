// export.js - Handles exporting the layout to HTML

document.addEventListener("DOMContentLoaded", () => {
  const exportBtn = document.getElementById('export');

  // Helper function to create a downloadable file
  function downloadFile(filename, content) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  // Export functionality: clone the preview, clean it up, and generate clean HTML
  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const preview = document.getElementById('preview');
    const previewClone = preview.cloneNode(true);
    
    // Remove any placeholder paragraphs from each grid
    previewClone.querySelectorAll('r-grid').forEach(grid => {
      grid.querySelectorAll('p').forEach(p => {
        if (p.textContent.includes("Click grid to select")) {
          p.remove();
        }
      });
      
      // Clean up grid for export
      cleanupGrid(grid);
    });
    
    // Remove the header (e.g. "Page Preview") from the clone
    const header = previewClone.querySelector('h2');
    if (header) header.remove();
    
    // Clean up all elements
    previewClone.querySelectorAll('.editable-element').forEach(el => {
      cleanupElement(el);
    });
    
    // Clean up all cells
    previewClone.querySelectorAll('r-cell').forEach(cell => {
      cleanupCell(cell);
    });
    
    // Extract all color classes used in the document
    const colorClasses = extractColorClasses(previewClone, window.pageStyles);
    
    // Process custom inline styles for elements
    previewClone.querySelectorAll('*[style]').forEach(el => {
      processInlineStyles(el);
    });
    
    // Generate CSS for the used color classes
    const colorStyles = generateColorStyles(colorClasses, window.pageStyles);
    
    // Generate CSS for font size, font family, and container width
    const fontAndContainerStyles = generateFontAndContainerStyles(window.pageStyles);
    
    // Determine body classes for page-wide styling
    let bodyClasses = [];
    if (window.pageStyles && window.pageStyles.backgroundColor && window.pageStyles.backgroundColor !== "custom") {
      bodyClasses.push(window.pageStyles.backgroundColor);
    }
    if (window.pageStyles && window.pageStyles.textColor && window.pageStyles.textColor !== "custom") {
      bodyClasses.push(window.pageStyles.textColor);
    }
    
    const bodyClassAttribute = bodyClasses.length > 0 ? ` class="${bodyClasses.join(' ')}"` : '';
    
    // Generate Google Fonts links
    const googleFontsLinks = generateGoogleFontsLinks(window.pageStyles);
    
    // Assemble the final HTML
    const exportedHTML = `
<!DOCTYPE html>
<html lang=en>
<head>
  <meta charset=UTF-8>
  <meta name=viewport content="width=device-width, initial-scale=1.0">
  <link rel=stylesheet href=https://rsms.me/inter/inter.css>
  <link rel=stylesheet href=https://rsms.me/res/fonts/iaw.css>
${googleFontsLinks}  <link rel=stylesheet href=raster2.css>
  <link rel=stylesheet href=utilities.css>
  ${colorStyles}${fontAndContainerStyles}
</head>
<body${bodyClassAttribute}>
  ${previewClone.innerHTML}
</body>
</html>
  `.trim();
    
    // Create a downloadable file
    downloadFile('raster-layout.html', exportedHTML);
  });
  
  // Helper functions for export
  
  // Clean up elements for export
  function cleanupElement(element) {
    element.classList.remove('editable-element');
    element.classList.remove('selected-element');
    element.removeAttribute('data-id');
    
    // Remove movement controls
    const controls = element.querySelector('.movement-controls');
    if (controls) {
      controls.remove();
    }
  }

  // Clean up a grid for export
  function cleanupGrid(grid) {
    grid.classList.remove('debug');
    grid.classList.remove('selected');
    grid.classList.remove('grid-container');
    grid.classList.remove('show-base-grid');
    grid.removeAttribute('data-id');
    
    // Remove grid movement controls
    const controls = grid.querySelector('.grid-movement-controls');
    if (controls) {
      controls.remove();
    }
  }

  // Clean up a cell for export
  function cleanupCell(cell) {
    cell.classList.remove('selected');
    cell.classList.remove('cell');
    cell.removeAttribute('data-id');
    // Remove the temporary inline padding style
    cell.style.padding = '';
  }
  
  // Process inline styles for elements
  function processInlineStyles(element) {
    // Convert inline styles to custom properties for better handling in the exported CSS
    if (element.style.color) {
      element.setAttribute('style', `--custom-color: ${element.style.color};`);
    }
    if (element.style.backgroundColor) {
      element.setAttribute('style', `--custom-bg-color: ${element.style.backgroundColor};`);
    }
  }
  
  // Extract all color classes used in the document
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
  
  // Generate CSS for color classes
  function generateColorStyles(colorClasses, pageStyles) {
    let colorStyles = '<style>\n';
    
    // Add color definitions
    colorClasses.forEach(cls => {
      if (cls.startsWith('text-') || cls.startsWith('bg-')) {
        const color = getColorForClass(cls);
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
  
  // Get color value for a class
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
  
  // Generate CSS for font and container styles
  function generateFontAndContainerStyles(pageStyles) {
    if (!pageStyles) return '';
    
    let styles = '<style>\n';
    
    // Add fluid typography variables
    styles += '  :root {\n';
    styles += '    --step--2: clamp(0.6944rem, 0.6856rem + 0.0444vw, 0.72rem);\n';
    styles += '    --step--1: clamp(0.8333rem, 0.8101rem + 0.1159vw, 0.9rem);\n';
    styles += '    --step-0: clamp(1rem, 0.9565rem + 0.2174vw, 1.125rem);\n';
    styles += '    --step-1: clamp(1.2rem, 1.1283rem + 0.3587vw, 1.4063rem);\n';
    styles += '    --step-2: clamp(1.44rem, 1.3295rem + 0.5527vw, 1.7578rem);\n';
    styles += '    --step-3: clamp(1.728rem, 1.5648rem + 0.8161vw, 2.1973rem);\n';
    styles += '    --step-4: clamp(2.0736rem, 1.8395rem + 1.1704vw, 2.7466rem);\n';
    styles += '    --step-5: clamp(2.4883rem, 2.1597rem + 1.6433vw, 3.4332rem);\n';
    styles += '  }\n';
    
    // Font size
    if (pageStyles.fontSize) {
      const fontSize = pageStyles.fontSize.replace('font-size-', '');
      let fontSizeValue = 'var(--step-0)'; // Default
      
      switch (fontSize) {
        case 'small':
          fontSizeValue = 'var(--step--1)';
          break;
        case 'medium':
          fontSizeValue = 'var(--step-0)';
          break;
        case 'large':
          fontSizeValue = 'var(--step-1)';
          break;
        case 'xlarge':
          fontSizeValue = 'var(--step-2)';
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
  
  // Generate Google Fonts links
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
});