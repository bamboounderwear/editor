// export.js - Handles exporting the layout to HTML

document.addEventListener("DOMContentLoaded", () => {
  const exportBtn = document.getElementById('export');
  const exportTextarea = document.getElementById('export-code');

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

  // Export functionality: clone the preview, remove placeholder text and header, and generate clean HTML.
  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const previewClone = preview.cloneNode(true);
    
    // Remove any placeholder paragraphs (with "Click grid to select") from each grid.
    previewClone.querySelectorAll('r-grid').forEach(grid => {
      grid.querySelectorAll('p').forEach(p => {
        if (p.textContent.includes("Click grid to select")) {
          p.remove();
        }
      });
      // Remove debug class from grids for export
      grid.classList.remove('debug');
      grid.classList.remove('selected');
      grid.classList.remove('grid-container');
      grid.classList.remove('show-base-grid'); // Remove show-base-grid class for export
      
      // Remove data-id attributes
      grid.removeAttribute('data-id');
    });
    
    // Remove the header (e.g. "Page Preview") from the clone.
    const header = previewClone.querySelector('h2');
    if (header) header.remove();
    
    // Remove all editable-element classes and selected-element classes
    previewClone.querySelectorAll('.editable-element').forEach(el => {
      el.classList.remove('editable-element');
      el.classList.remove('selected-element');
      el.removeAttribute('data-id');
    });
    
    // Remove all selected classes from cells and inline padding styles
    previewClone.querySelectorAll('r-cell').forEach(cell => {
      cell.classList.remove('selected');
      cell.classList.remove('cell');
      cell.removeAttribute('data-id');
      // Remove the temporary inline padding style
      cell.style.padding = '';
    });
    
    // Extract all color classes used in the document
    const colorClasses = [];
    const textColorRegex = /text-[a-z]+/;
    const bgColorRegex = /bg-[a-z]+/;
    
    // Check for text color classes
    previewClone.querySelectorAll('*').forEach(el => {
      el.classList.forEach(cls => {
        if (textColorRegex.test(cls) || bgColorRegex.test(cls)) {
          if (!colorClasses.includes(cls)) {
            colorClasses.push(cls);
          }
        }
      });
    });
    
    // Add page-level color classes if they exist
    if (window.pageStyles && window.pageStyles.backgroundColor && window.pageStyles.backgroundColor !== "custom") {
      if (!colorClasses.includes(window.pageStyles.backgroundColor)) {
        colorClasses.push(window.pageStyles.backgroundColor);
      }
    }
    
    if (window.pageStyles && window.pageStyles.textColor && window.pageStyles.textColor !== "custom") {
      if (!colorClasses.includes(window.pageStyles.textColor)) {
        colorClasses.push(window.pageStyles.textColor);
      }
    }
    
    // Generate CSS for the used color classes
    let colorStyles = '';
    if (colorClasses.length > 0 || 
        (window.pageStyles && (window.pageStyles.backgroundColor === "custom" || window.pageStyles.textColor === "custom"))) {
      colorStyles = '<style>\n';
      
      // Add color definitions
      colorClasses.forEach(cls => {
        if (cls.startsWith('text-')) {
          const color = getColorForClass(cls);
          if (color) {
            colorStyles += `  .${cls} { color: ${color}; }\n`;
          }
        } else if (cls.startsWith('bg-')) {
          const color = getColorForClass(cls);
          if (color) {
            colorStyles += `  .${cls} { background-color: ${color}; }\n`;
          }
        }
      });
      
      // Add custom colors if used
      if (window.pageStyles && window.pageStyles.backgroundColor === "custom") {
        colorStyles += `  body { background-color: ${window.pageStyles.customBgColor}; }\n`;
      }
      
      if (window.pageStyles && window.pageStyles.textColor === "custom") {
        colorStyles += `  body { color: ${window.pageStyles.customTextColor}; }\n`;
      }
      
      // Add min-height style for the body
      colorStyles += '  body { min-height: calc(100vh - 60px); }\n';
      
      // Add custom element styles
      colorStyles += '  [style*="color:"] { color: var(--custom-color, inherit); }\n';
      colorStyles += '  [style*="background-color:"] { background-color: var(--custom-bg-color, inherit); }\n';
      
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
    } else {
      // If no color classes, still add the min-height style and button styling
      colorStyles = '<style>\n';
      colorStyles += '  body { min-height: calc(100vh - 60px); }\n';
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
    }
    
    // Generate CSS for font size, font family, and container width
    let fontAndContainerStyles = '';
    if (window.pageStyles) {
      fontAndContainerStyles = '<style>\n';
      
      // Font size
      if (window.pageStyles.fontSize) {
        const fontSize = window.pageStyles.fontSize.replace('font-size-', '');
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
        
        fontAndContainerStyles += `  :root { --fontSize: ${fontSizeValue}; }\n`;
      }
      
      // Heading font family
      if (window.pageStyles.headingFont) {
        const headingFont = window.pageStyles.headingFont.replace('heading-font-', '');
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
        
        fontAndContainerStyles += `  h1, h2, h3, h4, h5, h6 { font-family: ${headingFontValue}; }\n`;
      }
      
      // Heading font weight
      if (window.pageStyles.headingWeight) {
        const headingWeight = window.pageStyles.headingWeight.replace('heading-weight-', '');
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
          case 'semib old':
            headingWeightValue = '600';
            break;
          case 'bold':
            headingWeightValue = '700';
            break;
        }
        
        fontAndContainerStyles += `  h1, h2, h3, h4, h5, h6 { font-weight: ${headingWeightValue}; }\n`;
      }
      
      // Body font family
      if (window.pageStyles.bodyFont) {
        const bodyFont = window.pageStyles.bodyFont.replace('body-font-', '');
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
        
        fontAndContainerStyles += `  body { font-family: ${bodyFontValue}; }\n`;
      }
      
      // Body font weight
      if (window.pageStyles.bodyWeight) {
        const bodyWeight = window.pageStyles.bodyWeight.replace('body-weight-', '');
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
        
        fontAndContainerStyles += `  body { font-weight: ${bodyWeightValue}; }\n`;
      }
      
      // Container width
      if (window.pageStyles.containerWidth) {
        const containerWidth = window.pageStyles.containerWidth.replace('container-', '');
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
          fontAndContainerStyles += `  body > * { max-width: ${containerWidthValue}; margin-left: auto; margin-right: auto; }\n`;
        }
      }
      
      fontAndContainerStyles += '</style>\n';
    }
    
    // Determine body classes for page-wide styling
    let bodyClasses = [];
    if (window.pageStyles && window.pageStyles.backgroundColor && window.pageStyles.backgroundColor !== "custom") {
      bodyClasses.push(window.pageStyles.backgroundColor);
    }
    if (window.pageStyles && window.pageStyles.textColor && window.pageStyles.textColor !== "custom") {
      bodyClasses.push(window.pageStyles.textColor);
    }
    
    const bodyClassAttribute = bodyClasses.length > 0 ? ` class="${bodyClasses.join(' ')}"` : '';
    
    // Determine which Google Fonts to include
    let googleFontsLinks = '';
    if (window.pageStyles) {
      const fontsToInclude = new Set();
      
      // Check heading font
      if (window.pageStyles.headingFont && window.pageStyles.headingFont !== 'heading-font-inter') {
        const fontName = window.pageStyles.headingFont.replace('heading-font-', '');
        fontsToInclude.add(fontName);
      }
      
      // Check body font
      if (window.pageStyles.bodyFont && window.pageStyles.bodyFont !== 'body-font-inter') {
        const fontName = window.pageStyles.bodyFont.replace('body-font-', '');
        fontsToInclude.add(fontName);
      }
      
      // Generate Google Fonts links
      fontsToInclude.forEach(font => {
        const formattedFont = font.charAt(0).toUpperCase() + font.slice(1);
        googleFontsLinks += `  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${formattedFont}:wght@300;400;500;600;700&display=swap">\n`;
      });
    }
    
    // Process custom inline styles for elements
    previewClone.querySelectorAll('*[style]').forEach(el => {
      // Convert inline styles to custom properties for better handling in the exported CSS
      if (el.style.color) {
        el.setAttribute('style', `--custom-color: ${el.style.color};`);
      }
      if (el.style.backgroundColor) {
        el.setAttribute('style', `--custom-bg-color: ${el.style.backgroundColor};`);
      }
    });
    
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

  // Helper function to get the color value for a class
  function getColorForClass(className) {
    switch (className) {
      // Text colors
      case 'text-white': return '#ffffff';
      case 'text-light': return '#f8f9fa';
      case 'text-gray': return '#6c757d';
      case 'text-dark': return '#343a40';
      case 'text-primary': return '#007bff';
      case 'text-secondary': return '#6c757d';
      case 'text-success': return '#28a745';
      case 'text-danger': return '#dc3545';
      case 'text-warning': return '#ffc107';
      case 'text-info': return '#17a2b8';
      case 'text-purple': return '#6f42c1';
      case 'text-pink': return '#e83e8c';
      case 'text-orange': return '#fd7e14';
      case 'text-teal': return '#20c997';
      
      // Background colors
      case 'bg-white': return '#ffffff';
      case 'bg-light': return '#f8f9fa';
      case 'bg-gray': return '#6c757d';
      case 'bg-dark': return '#343a40';
      case 'bg-primary': return '#007bff';
      case 'bg-secondary': return '#6c757d';
      case 'bg-success': return '#28a745';
      case 'bg-danger': return '#dc3545';
      case 'bg-warning': return '#ffc107';
      case 'bg-info': return '#17a2b8';
      case 'bg-purple': return '#6f42c1';
      case 'bg-pink': return '#e83e8c';
      case 'bg-orange': return '#fd7e14';
      case 'bg-teal': return '#20c997';
      
      default: return null;
    }
  }
});