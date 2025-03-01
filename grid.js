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

// Toggle base grid button
const toggleBaseGridBtn = document.getElementById('toggle-base-grid');

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
  grid.classList.add('show-base-grid'); // Add show-base-grid class for baseline visualization
  
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
  if (window.pageStyles && window.pageStyles.backgroundColor) {
    if (!colorClasses.includes(window.pageStyles.backgroundColor)) {
      colorClasses.push(window.pageStyles.backgroundColor);
    }
  }
  
  if (window.pageStyles && window.pageStyles.textColor) {
    if (!colorClasses.includes(window.pageStyles.textColor)) {
      colorClasses.push(window.pageStyles.textColor);
    }
  }
  
  // Generate CSS for the used color classes
  let colorStyles = '';
  if (colorClasses.length > 0) {
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
    
    // Add min-height style for the body
    colorStyles += '  body { min-height: calc(100vh - 60px); }\n';
    
    colorStyles += '</style>\n';
  } else {
    // If no color classes, still add the min-height style
    colorStyles = '<style>\n  body { min-height: calc(100vh - 60px); }\n</style>\n';
  }
  
  // Determine body classes for page-wide styling
  let bodyClasses = [];
  if (window.pageStyles && window.pageStyles.backgroundColor) {
    bodyClasses.push(window.pageStyles.backgroundColor);
  }
  if (window.pageStyles && window.pageStyles.textColor) {
    bodyClasses.push(window.pageStyles.textColor);
  }
  
  const bodyClassAttribute = bodyClasses.length > 0 ? ` class="${bodyClasses.join(' ')}"` : '';
  
  const exportedHTML = `
<!DOCTYPE html>
<html lang=en>
<head>
  <meta charset=UTF-8>
  <meta name=viewport content="width=device-width, initial-scale=1.0">
  <link rel=stylesheet href=https://rsms.me/inter/inter.css>
  <link rel=stylesheet href=https://rsms.me/res/fonts/iaw.css>
  <link rel=stylesheet href=raster2.css>
  ${colorStyles}
</head>
<body${bodyClassAttribute}>
  ${previewClone.innerHTML}
</body>
</html>
  `.trim();
  
  // Create a downloadable file
  downloadFile('raster-layout.html', exportedHTML);
  
  // Also show the HTML in the textarea for reference
  exportTextarea.style.display = 'block';
  exportTextarea.value = exportedHTML;
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

// Toggle base grid visibility for all grids
toggleBaseGridBtn.addEventListener('click', () => {
  document.querySelectorAll('r-grid').forEach(grid => {
    grid.classList.toggle('show-base-grid');
  });
});

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