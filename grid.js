// grid.js

// Variables to hold the currently selected grid and cell.
let selectedGrid = null;
let selectedCell = null;

// Get references to controls.
const addGridBtn = document.getElementById('add-grid');
const gridColumnsInput = document.getElementById('grid-columns');
const gridMobileInput = document.getElementById('grid-columns-mobile');
const preview = document.getElementById('preview');
const addCellBtn = document.getElementById('add-cell');
const cellControls = document.getElementById('cell-controls');
const cellSpanInput = document.getElementById('cell-span');
const updateCellBtn = document.getElementById('update-cell');
const styleCellBtn = document.getElementById('style-cell');
const exportBtn = document.getElementById('export');
const exportTextarea = document.getElementById('export-code');

// Delete buttons
const deleteElementBtn = document.getElementById('delete-element');
const deleteCellBtn = document.getElementById('delete-cell');
const deleteGridBtn = document.getElementById('delete-grid');

// Element buttons
const elementButtons = document.querySelectorAll('.element-buttons button');

// Undo button
const undoBtn = document.getElementById('undo-button');

// Clears the currently selected grid.
function clearGridSelection() {
  document.querySelectorAll('r-grid').forEach(grid => grid.classList.remove('selected'));
  selectedGrid = null;
  addCellBtn.disabled = true;
  deleteGridBtn.disabled = true;
  
  // Disable all element buttons when no grid is selected
  elementButtons.forEach(button => {
    button.disabled = true;
  });
}

// Clears the currently selected cell.
function clearCellSelection() {
  document.querySelectorAll('r-cell.selected').forEach(cell => cell.classList.remove('selected'));
  selectedCell = null;
  window.selectedCell = null; // Clear the global reference
  cellControls.style.display = 'none';
  deleteCellBtn.disabled = true;
  
  // Disable all element buttons when no cell is selected
  elementButtons.forEach(button => {
    button.disabled = true;
  });
}

// Add event listeners to a grid
function addGridEventListeners(grid) {
  grid.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'r-cell') return;
    clearGridSelection();
    clearCellSelection();
    selectedGrid = grid;
    grid.classList.add('selected');
    addCellBtn.disabled = false;
    deleteGridBtn.disabled = false;
    e.stopPropagation();
  });
}

// Add event listeners to a cell
function addCellEventListeners(cell) {
  cell.addEventListener('click', (e) => {
    e.stopPropagation();
    clearCellSelection();
    selectedCell = cell;
    window.selectedCell = cell; // Expose globally for elements.js.
    cell.classList.add('selected');
    // Populate the update input with the current desktop span value.
    cellSpanInput.value = cell.getAttribute('span');
    cellControls.style.display = 'block';
    deleteCellBtn.disabled = false;
    
    // Enable all element buttons when a cell is selected
    elementButtons.forEach(button => {
      button.disabled = false;
    });
  });
}

// Create a new grid when "Add Grid" is clicked.
addGridBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const cols = gridColumnsInput.value;
  const mobileCols = gridMobileInput.value;
  
  // Create a new grid element.
  const grid = document.createElement('r-grid');
  const gridId = window.historyManager.generateUniqueId();
  grid.setAttribute('data-id', gridId);
  grid.setAttribute('columns', cols);
  grid.setAttribute('columns-s', mobileCols);
  grid.classList.add('grid-container');
  grid.classList.add('debug'); // Add debug class to the grid for visualization
  grid.classList.add('show-base-grid'); // Always keep baseline grid on
  
  // Add event listeners to the grid
  addGridEventListeners(grid);
  
  // Add the grid to the preview
  preview.appendChild(grid);
  
  // Add to history
  window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.ADD_GRID, {
    gridId: gridId
  });
  
  clearGridSelection();
  clearCellSelection();
});

// Find the next available span range for a new cell
function getNextAvailableSpan(grid) {
  const totalColumns = parseInt(grid.getAttribute('columns'), 10) || 6;
  const existingCells = Array.from(grid.querySelectorAll('r-cell'));
  
  if (existingCells.length === 0) {
    // If no cells exist, start with column 1 and span half the grid (or 1 column if grid has only 1 column)
    const spanWidth = Math.max(1, Math.ceil(totalColumns / 2));
    return `1-${spanWidth}`;
  }
  
  // Find the last cell's span attribute
  const lastCell = existingCells[existingCells.length - 1];
  const lastSpan = lastCell.getAttribute('span');
  
  // Parse the span to find the ending column
  let endColumn = 0;
  
  if (lastSpan.includes('-')) {
    // Format: "1-3" means columns 1 through 3
    endColumn = parseInt(lastSpan.split('-')[1], 10);
  } else if (lastSpan.includes('+')) {
    // Format: "1+2" means starting at column 1 and spanning 2 columns
    const parts = lastSpan.split('+');
    const start = parseInt(parts[0], 10);
    const width = parseInt(parts[1], 10);
    endColumn = start + width - 1;
  } else if (lastSpan === 'row') {
    // Spans the entire row, so next cell should start at column 1
    return '1-2';
  } else {
    // Single column format: "2" means just column 2
    endColumn = parseInt(lastSpan, 10);
  }
  
  // Calculate the next starting column
  const nextStart = endColumn + 1;
  
  // If we've reached the end of the row, wrap to the next row
  if (nextStart > totalColumns) {
    return '1-2';
  }
  
  // Calculate the span width (try to use half the remaining columns)
  const remainingColumns = totalColumns - nextStart + 1;
  const spanWidth = Math.max(1, Math.min(Math.ceil(remainingColumns / 2), remainingColumns));
  const nextEnd = nextStart + spanWidth - 1;
  
  return `${nextStart}-${nextEnd}`;
}

// Add a new cell to the currently selected grid.
addCellBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!selectedGrid) return;
  
  const cell = document.createElement('r-cell');
  const cellId = window.historyManager.generateUniqueId();
  cell.setAttribute('data-id', cellId);
  cell.classList.add('cell'); // Add a class to identify cells for styling
  
  // Get the next available span range
  const nextSpan = getNextAvailableSpan(selectedGrid);
  cell.setAttribute('span', nextSpan);
  
  // Set default mobile span so the cell spans one column on small screens
  cell.setAttribute('span-s', '1');
  
  // Add temporary padding to the cell until elements are added
  cell.style.padding = '10px';
  
  // Add event listeners to the cell
  addCellEventListeners(cell);
  
  // Add the cell to the grid
  selectedGrid.appendChild(cell);
  
  // Add to history
  window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.ADD_CELL, {
    cellId: cellId,
    gridId: selectedGrid.getAttribute('data-id')
  });
  
  // Automatically select the newly added cell
  clearCellSelection();
  selectedCell = cell;
  window.selectedCell = cell; // Set the global reference
  cell.classList.add('selected');
  cellSpanInput.value = cell.getAttribute('span');
  cellControls.style.display = 'block';
  deleteCellBtn.disabled = false;
  
  // Enable all element buttons for the newly selected cell
  elementButtons.forEach(button => {
    button.disabled = false;
  });
});

// Update the selected cell's desktop span attribute.
updateCellBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!selectedCell) return;
  
  // Store previous values for undo
  const previousSpan = selectedCell.getAttribute('span');
  const previousSpanS = selectedCell.getAttribute('span-s');
  
  // Update the span
  const newRange = cellSpanInput.value;
  selectedCell.setAttribute('span', newRange);
  
  // Add to history
  window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.UPDATE_CELL, {
    cellId: selectedCell.getAttribute('data-id'),
    previousSpan: previousSpan,
    previousSpanS: previousSpanS,
    newSpan: newRange
  });
});

// Delete the selected element
deleteElementBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (window.selectedElement) {
    // Store element data for undo
    const elementId = window.selectedElement.getAttribute('data-id');
    const cellId = window.selectedElement.closest('r-cell').getAttribute('data-id');
    const elementHtml = window.selectedElement.outerHTML;
    
    // Remove the element
    window.selectedElement.remove();
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.DELETE_ELEMENT, {
      elementId: elementId,
      cellId: cellId,
      elementHtml: elementHtml
    });
    
    window.selectedElement = null;
    deleteElementBtn.disabled = true;
    document.getElementById('open-style-modal').disabled = true;
  }
});

// Delete the selected cell
deleteCellBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (selectedCell) {
    // Store cell data for undo
    const cellId = selectedCell.getAttribute('data-id');
    const gridId = selectedCell.closest('r-grid').getAttribute('data-id');
    const cellHtml = selectedCell.outerHTML;
    
    // Remove the cell
    selectedCell.remove();
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.DELETE_CELL, {
      cellId: cellId,
      gridId: gridId,
      cellHtml: cellHtml
    });
    
    clearCellSelection();
  }
});

// Delete the selected grid
deleteGridBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (selectedGrid) {
    // Store grid data for undo
    const gridId = selectedGrid.getAttribute('data-id');
    const gridHtml = selectedGrid.outerHTML;
    
    // Remove the grid
    selectedGrid.remove();
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.DELETE_GRID, {
      gridId: gridId,
      gridHtml: gridHtml
    });
    
    clearGridSelection();
  }
});

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

// Undo button click handler
undoBtn.addEventListener('click', () => {
  window.historyManager.undo();
});

// Prevent global clearing when clicking inside the sidebar.
document.querySelector('.sidebar').addEventListener('click', (e) => {
  e.stopPropagation();
});

// Global click: clear selections if clicking outside the sidebar.
document.body.addEventListener('click', (e) => {
  if (e.target.closest('.sidebar')) return;
  clearGridSelection();
  clearCellSelection();
});

// Initialize: disable all element buttons on page load
document.addEventListener('DOMContentLoaded', () => {
  elementButtons.forEach(button => {
    button.disabled = true;
  });
  
  // Initialize undo button state
  undoBtn.disabled = true;
});

// Make functions available globally
window.clearGridSelection = clearGridSelection;
window.clearCellSelection = clearCellSelection;
window.addGridEventListeners = addGridEventListeners;
window.addCellEventListeners = addCellEventListeners;