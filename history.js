// history.js - Manages the undo/redo functionality

// History stack to store actions
const historyStack = [];
let currentIndex = -1;
const maxHistorySize = 50; // Limit history size to prevent memory issues

// Action types
const ACTION_TYPES = {
  ADD_GRID: 'ADD_GRID',
  DELETE_GRID: 'DELETE_GRID',
  ADD_CELL: 'ADD_CELL',
  DELETE_CELL: 'DELETE_CELL',
  UPDATE_CELL: 'UPDATE_CELL',
  ADD_ELEMENT: 'ADD_ELEMENT',
  DELETE_ELEMENT: 'DELETE_ELEMENT',
  STYLE_ELEMENT: 'STYLE_ELEMENT',
  STYLE_CELL: 'STYLE_CELL'
};

// Add an action to the history stack
function addToHistory(actionType, data) {
  // If we're not at the end of the stack, remove future actions
  if (currentIndex < historyStack.length - 1) {
    historyStack.splice(currentIndex + 1);
  }
  
  // Add the new action
  historyStack.push({
    type: actionType,
    data: data,
    timestamp: Date.now()
  });
  
  // Increment the current index
  currentIndex++;
  
  // Limit history size
  if (historyStack.length > maxHistorySize) {
    historyStack.shift();
    currentIndex--;
  }
  
  // Enable/disable undo button
  updateUndoButtonState();
}

// Update the undo button state
function updateUndoButtonState() {
  const undoBtn = document.getElementById('undo-button');
  if (undoBtn) {
    undoBtn.disabled = currentIndex < 0;
  }
}

// Perform undo operation
function undo() {
  if (currentIndex < 0) return; // Nothing to undo
  
  const action = historyStack[currentIndex];
  currentIndex--;
  
  // Handle the undo based on action type
  switch (action.type) {
    case ACTION_TYPES.ADD_GRID:
      undoAddGrid(action.data);
      break;
    case ACTION_TYPES.DELETE_GRID:
      undoDeleteGrid(action.data);
      break;
    case ACTION_TYPES.ADD_CELL:
      undoAddCell(action.data);
      break;
    case ACTION_TYPES.DELETE_CELL:
      undoDeleteCell(action.data);
      break;
    case ACTION_TYPES.UPDATE_CELL:
      undoUpdateCell(action.data);
      break;
    case ACTION_TYPES.ADD_ELEMENT:
      undoAddElement(action.data);
      break;
    case ACTION_TYPES.DELETE_ELEMENT:
      undoDeleteElement(action.data);
      break;
    case ACTION_TYPES.STYLE_ELEMENT:
      undoStyleElement(action.data);
      break;
    case ACTION_TYPES.STYLE_CELL:
      undoStyleCell(action.data);
      break;
  }
  
  updateUndoButtonState();
}

// Undo handlers for each action type
function undoAddGrid(data) {
  const grid = document.querySelector(`r-grid[data-id="${data.gridId}"]`);
  if (grid) {
    grid.remove();
    clearGridSelection();
  }
}

function undoDeleteGrid(data) {
  const preview = document.getElementById('preview');
  const gridHtml = data.gridHtml;
  
  // Create a temporary container to parse the HTML
  const temp = document.createElement('div');
  temp.innerHTML = gridHtml;
  const grid = temp.firstChild;
  
  // Add event listeners to the restored grid
  addGridEventListeners(grid);
  
  // Add the grid back to the preview
  preview.appendChild(grid);
}

function undoAddCell(data) {
  const cell = document.querySelector(`r-cell[data-id="${data.cellId}"]`);
  if (cell) {
    cell.remove();
    clearCellSelection();
  }
}

function undoDeleteCell(data) {
  const grid = document.querySelector(`r-grid[data-id="${data.gridId}"]`);
  if (grid) {
    const cellHtml = data.cellHtml;
    
    // Create a temporary container to parse the HTML
    const temp = document.createElement('div');
    temp.innerHTML = cellHtml;
    const cell = temp.firstChild;
    
    // Add event listeners to the restored cell
    addCellEventListeners(cell);
    
    // Add the cell back to the grid
    grid.appendChild(cell);
  }
}

function undoUpdateCell(data) {
  const cell = document.querySelector(`r-cell[data-id="${data.cellId}"]`);
  if (cell) {
    // Restore previous span attributes
    cell.setAttribute('span', data.previousSpan);
    if (data.previousSpanS) {
      cell.setAttribute('span-s', data.previousSpanS);
    }
  }
}

function undoAddElement(data) {
  const element = document.querySelector(`[data-id="${data.elementId}"]`);
  if (element) {
    element.remove();
  }
}

function undoDeleteElement(data) {
  const cell = document.querySelector(`r-cell[data-id="${data.cellId}"]`);
  if (cell) {
    const elementHtml = data.elementHtml;
    
    // Create a temporary container to parse the HTML
    const temp = document.createElement('div');
    temp.innerHTML = elementHtml;
    const element = temp.firstChild;
    
    // Add event listeners to the restored element
    addElementEventListeners(element);
    
    // Add the element back to the cell
    cell.appendChild(element);
  }
}

function undoStyleElement(data) {
  const element = document.querySelector(`[data-id="${data.elementId}"]`);
  if (element) {
    // Restore previous styles and content
    element.className = data.previousClasses;
    if (element.tagName.toLowerCase() === 'img') {
      element.src = data.previousContent;
    } else {
      element.textContent = data.previousContent;
    }
  }
}

function undoStyleCell(data) {
  const cell = document.querySelector(`r-cell[data-id="${data.cellId}"]`);
  if (cell) {
    // Restore previous styles
    cell.className = data.previousClasses;
  }
}

// Generate a unique ID
function generateUniqueId() {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Export functions and constants
window.historyManager = {
  addToHistory,
  undo,
  ACTION_TYPES,
  generateUniqueId
};