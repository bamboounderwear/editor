// grid.js - Handles grid and cell creation and management

document.addEventListener("DOMContentLoaded", () => {
  // Variables to hold the currently selected grid and cell.
  window.selectedGrid = null;
  window.selectedCell = null;

  // Get references to controls.
  const addGridBtn = document.getElementById('add-grid');
  const gridColumnsInput = document.getElementById('grid-columns');
  const gridMobileInput = document.getElementById('grid-columns-mobile');
  const preview = document.getElementById('preview');
  const addCellBtn = document.getElementById('add-cell');
  const cellControls = document.getElementById('cell-controls');
  const cellSpanInput = document.getElementById('cell-span');
  const updateCellBtn = document.getElementById('update-cell');
  const deleteCellBtn = document.getElementById('delete-cell');
  const deleteGridBtn = document.getElementById('delete-grid');

  // Element buttons
  const elementButtons = document.querySelectorAll('.element-buttons button');

  // Clears the currently selected grid.
  function clearGridSelection() {
    document.querySelectorAll('r-grid').forEach(grid => grid.classList.remove('selected'));
    window.selectedGrid = null;
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
    window.selectedCell = null;
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
      window.selectedGrid = grid;
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
      window.selectedCell = cell;
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

  // Add a new cell to the currently selected grid.
  addCellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!window.selectedGrid) return;
    
    const cell = document.createElement('r-cell');
    const cellId = window.historyManager.generateUniqueId();
    cell.setAttribute('data-id', cellId);
    cell.classList.add('cell'); // Add a class to identify cells for styling
    
    // Get the next available span range
    const nextSpan = getNextAvailableSpan(window.selectedGrid);
    cell.setAttribute('span', nextSpan);
    
    // Set default mobile span so the cell spans one column on small screens
    cell.setAttribute('span-s', '1');
    
    // Add temporary padding to the cell until elements are added
    cell.style.padding = '10px';
    
    // Add event listeners to the cell
    addCellEventListeners(cell);
    
    // Add the cell to the grid
    window.selectedGrid.appendChild(cell);
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.ADD_CELL, {
      cellId: cellId,
      gridId: window.selectedGrid.getAttribute('data-id')
    });
    
    // Automatically select the newly added cell
    clearCellSelection();
    window.selectedCell = cell;
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
    if (!window.selectedCell) return;
    
    // Store previous values for undo
    const previousSpan = window.selectedCell.getAttribute('span');
    const previousSpanS = window.selectedCell.getAttribute('span-s');
    
    // Update the span
    const newRange = cellSpanInput.value;
    window.selectedCell.setAttribute('span', newRange);
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.UPDATE_CELL, {
      cellId: window.selectedCell.getAttribute('data-id'),
      previousSpan: previousSpan,
      previousSpanS: previousSpanS,
      newSpan: newRange
    });
  });

  // Delete the selected cell
  deleteCellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.selectedCell) {
      // Store cell data for undo
      const cellId = window.selectedCell.getAttribute('data-id');
      const gridId = window.selectedCell.closest('r-grid').getAttribute('data-id');
      const cellHtml = window.selectedCell.outerHTML;
      
      // Remove the cell
      window.selectedCell.remove();
      
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
    if (window.selectedGrid) {
      // Store grid data for undo
      const gridId = window.selectedGrid.getAttribute('data-id');
      const gridHtml = window.selectedGrid.outerHTML;
      
      // Remove the grid
      window.selectedGrid.remove();
      
      // Add to history
      window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.DELETE_GRID, {
        gridId: gridId,
        gridHtml: gridHtml
      });
      
      clearGridSelection();
    }
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
  elementButtons.forEach(button => {
    button.disabled = true;
  });
  
  // Initialize undo button state
  document.getElementById('undo-button').disabled = true;
  
  // Make functions available globally
  window.gridUtils = {
    clearGridSelection,
    clearCellSelection,
    addGridEventListeners,
    addCellEventListeners,
    getNextAvailableSpan
  };
});