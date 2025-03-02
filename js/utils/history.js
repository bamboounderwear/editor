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
  STYLE_CELL: 'STYLE_CELL',
  UPDATE_PAGE_STYLE: 'UPDATE_PAGE_STYLE'
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
    case ACTION_TYPES.UPDATE_PAGE_STYLE:
      undoUpdatePageStyle(action.data);
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
    if (data.previousStyle) {
      element.style.cssText = data.previousStyle;
    }
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
    if (data.previousStyle) {
      cell.style.cssText = data.previousStyle;
    }
  }
}

function undoUpdatePageStyle(data) {
  // Restore previous page styles
  window.pageStyles.backgroundColor = data.previousBgColor;
  window.pageStyles.textColor = data.previousTextColor;
  window.pageStyles.customBgColor = data.previousCustomBgColor;
  window.pageStyles.customTextColor = data.previousCustomTextColor;
  window.pageStyles.fontSize = data.previousFontSize;
  window.pageStyles.headingFont = data.previousHeadingFont;
  window.pageStyles.headingWeight = data.previousHeadingWeight;
  window.pageStyles.bodyFont = data.previousBodyFont;
  window.pageStyles.bodyWeight = data.previousBodyWeight;
  window.pageStyles.containerWidth = data.previousContainerWidth;
  
  // Apply styles to the preview container
  const preview = document.getElementById("preview");
  
  // Remove current background color classes and styles
  preview.classList.forEach(cls => {
    if (cls.startsWith("bg-")) {
      preview.classList.remove(cls);
    }
  });
  preview.style.backgroundColor = '';
  
  // Remove current text color classes and styles
  preview.classList.forEach(cls => {
    if (cls.startsWith("text-")) {
      preview.classList.remove(cls);
    }
  });
  preview.style.color = '';
  
  // Remove current font size classes
  preview.classList.forEach(cls => {
    if (cls.startsWith("font-size-")) {
      preview.classList.remove(cls);
    }
  });
  
  // Remove current heading font classes
  preview.classList.forEach(cls => {
    if (cls.startsWith("heading-font-")) {
      preview.classList.remove(cls);
    }
  });
  
  // Remove current heading weight classes
  preview.classList.forEach(cls => {
    if (cls.startsWith("heading-weight-")) {
      preview.classList.remove(cls);
    }
  });
  
  // Remove current body font classes
  preview.classList.forEach(cls => {
    if (cls.startsWith("body-font-")) {
      preview.classList.remove(cls);
    }
  });
  
  // Remove current body weight classes
  preview.classList.forEach(cls => {
    if (cls.startsWith("body-weight-")) {
      preview.classList.remove(cls);
    }
  });
  
  // Remove current container width classes
  preview.classList.forEach(cls => {
    if (cls.startsWith("container-")) {
      preview.classList.remove(cls);
    }
  });
  
  // Apply previous background color
  if (data.previousBgColor === "custom") {
    preview.style.backgroundColor = data.previousCustomBgColor || '';
  } else if (data.previousBgColor) {
    preview.classList.add(data.previousBgColor);
  }
  
  // Apply previous text color
  if (data.previousTextColor === "custom") {
    preview.style.color = data.previousCustomTextColor || '';
  } else if (data.previousTextColor) {
    preview.classList.add(data.previousTextColor);
  }
  
  // Add previous font size class if it existed and apply the actual font size
  if (data.previousFontSize) {
    preview.classList.add(data.previousFontSize);
    
    // Apply the actual font size to the preview element
    const fontSize = data.previousFontSize.replace('font-size-', '');
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
    
    // Set the CSS variable directly on the preview element
    preview.style.setProperty('--fontSize', fontSizeValue);
    
    // Also update the document root to ensure consistent sizing
    document.documentElement.style.setProperty('--fontSize', fontSizeValue);
  } else {
    // Reset to default font size
    preview.style.removeProperty('--fontSize');
    document.documentElement.style.removeProperty('--fontSize');
  }
  
  // Add previous heading font class if it existed
  if (data.previousHeadingFont) {
    preview.classList.add(data.previousHeadingFont);
  }
  
  // Add previous heading weight class if it existed
  if (data.previousHeadingWeight) {
    preview.classList.add(data.previousHeadingWeight);
  }
  
  // Add previous body font class if it existed
  if (data.previousBodyFont) {
    preview.classList.add(data.previousBodyFont);
  }
  
  // Add previous body weight class if it existed
  if (data.previousBodyWeight) {
    preview.classList.add(data.previousBodyWeight);
  }
  
  // Add previous container width class if it existed
  if (data.previousContainerWidth) {
    preview.classList.add(data.previousContainerWidth);
  }
  
  // Update Google Fonts
  updateGoogleFonts();
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