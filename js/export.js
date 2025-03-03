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
      window.exportUtils.cleanupGrid(grid);
    });
    
    // Remove the header (e.g. "Page Preview") from the clone
    const header = previewClone.querySelector('h2');
    if (header) header.remove();
    
    // Clean up all elements
    previewClone.querySelectorAll('.editable-element').forEach(el => {
      window.exportUtils.cleanupElement(el);
    });
    
    // Clean up all cells
    previewClone.querySelectorAll('r-cell').forEach(cell => {
      window.exportUtils.cleanupCell(cell);
    });
    
    // Extract all color classes used in the document
    const colorClasses = window.exportUtils.extractColorClasses(previewClone, window.pageStyles);
    
    // Process custom inline styles for elements
    previewClone.querySelectorAll('*[style]').forEach(el => {
      window.exportUtils.processInlineStyles(el);
    });
    
    // Generate CSS for the used color classes
    const colorStyles = window.exportUtils.generateColorStyles(colorClasses, window.pageStyles);
    
    // Generate CSS for font size, font family, and container width
    const fontAndContainerStyles = window.exportUtils.generateFontAndContainerStyles(window.pageStyles);
    
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
    const googleFontsLinks = window.exportUtils.generateGoogleFontsLinks(window.pageStyles);
    
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
});