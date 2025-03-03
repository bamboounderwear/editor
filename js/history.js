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
  UPDATE_PAGE_STYLE: 'UPDATE_PAGE_STYLE',
  REORDER_ELEMENT: 'REORDER_ELEMENT',
  REORDER_GRID: 'REORDER_GRID'
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
    case ACTION_TYPES.REORDER_ELEMENT:
      undoReorderElement(action.data);
      break;
    case ACTION_TYPES.REORDER_GRID:
      undoReorderGrid(action.data);
      break;
  }
  
  updateUndoButtonState();
}

// Undo handlers for each action type
function undoAddGrid(data) {
  const grid = document.querySelector(`r-grid[data-id="${data.gridId}"]`);
  if (grid) {
    grid.remove();
    window.gridUtils.clearGridSelection();
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
  window.gridUtils.addGridEventListeners(grid);
  
  // Add the grid back to the preview
  preview.appendChild(grid);
  
  // Add movement controls if reordering is enabled
  if (window.reorderEnabled && window.reorderUtils) {
    window.reorderUtils.addGridMovementControls(grid);
  }
}

function undoAddCell(data) {
  const cell = document.querySelector(`r-cell[data-id="${data.cellId}"]`);
  if (cell) {
    cell.remove();
    window.gridUtils.clearCellSelection();
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
    window.gridUtils.addCellEventListeners(cell);
    
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
    window.addElementEventListeners(element);
    
    // Add the element back to the cell
    cell.appendChild(element);
    
    // Add movement controls if reordering is enabled
    if (window.reorderEnabled && window.reorderUtils) {
      window.reorderUtils.addMovementControls(element);
    }
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
  
  // Remove current styles
  if (window.pageStylerUtils) {
    window.pageStylerUtils.removePageStyleClasses(preview);
  } else {
    // Fallback if pageStylerUtils is not available
    // Remove background color classes and styles
    preview.classList.forEach(cls => {
      if (cls.startsWith("bg-")) {
        preview.classList.remove(cls);
      }
    });
    preview.style.backgroundColor = '';
    
    // Remove text color classes and styles
    preview.classList.forEach(cls => {
      if (cls.startsWith("text-")) {
        preview.classList.remove(cls);
      }
    });
    preview.style.color = '';
    
    // Remove font size classes
    preview.classList.forEach(cls => {
      if (cls.startsWith("font-size-")) {
        preview.classList.remove(cls);
      }
    });
    
    // Remove font family classes
    preview.classList.forEach(cls => {
      if (cls.startsWith("heading-font-") || 
          cls.startsWith("heading-weight-") || 
          cls.startsWith("body-font-") || 
          cls.startsWith("body-weight-") || 
          cls.startsWith("container-")) {
        preview.classList.remove(cls);
      }
    });
  }
  
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
    
    if (window.pageStylerUtils) {
      window.pageStylerUtils.applyFontSizeVariable(preview, data.previousFontSize);
    } else {
      // Fallback if pageStylerUtils is not available
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
      
      // Apply to all r-grid elements
      const grids = preview.querySelectorAll('r-grid');
      grids.forEach(grid => {
        grid.style.setProperty('--fontSize', fontSizeValue);
      });
      
      // Also set on document.documentElement to ensure proper inheritance
      document.documentElement.style.setProperty('--fontSize', fontSizeValue);
    }
  } else {
    // Reset to default font size
    if (window.pageStylerUtils) {
      window.pageStylerUtils.resetFontSizeVariable(preview);
    } else {
      // Fallback if pageStylerUtils is not available
      preview.style.removeProperty('--fontSize');
      
      // Reset all r-grid elements
      const grids = preview.querySelectorAll('r-grid');
      grids.forEach(grid => {
        grid.style.removeProperty('--fontSize');
      });
      
      // Reset on document.documentElement
      document.documentElement.style.removeProperty('--fontSize');
    }
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
  window.updateGoogleFonts();
}

// Undo reordering of an element
function undoReorderElement(data) {
  const element = document.querySelector(`[data-id="${data.elementId}"]`);
  const cell = document.querySelector(`r-cell[data-id="${data.cellId}"]`);
  
  if (element && cell) {
    const children = Array.from(cell.children);
    const currentIndex = children.indexOf(element);
    
    // If the element needs to move up
    if ( data.previousIndex > currentIndex) {
      // Find the element that should be after our element
      const targetIndex = Math.min(data.previousIndex, children.length - 1);
      const targetElement = children[targetIndex];
      
      // Insert our element before the target element
      if (targetElement) {
        cell.insertBefore(element, targetElement.nextSibling);
      } else {
        cell.appendChild(element);
      }
    } 
    // If the element needs to move down
    else if (data.previousIndex < currentIndex) {
      // Find the element that should be before our element
      const targetElement = children[data.previousIndex];
      
      // Insert our element before the target element
      if (targetElement) {
        cell.insertBefore(element, targetElement);
      } else {
        cell.prepend(element);
      }
    }
  }
}

// Undo reordering of a grid
function undoReorderGrid(data) {
  const grid = document.querySelector(`r-grid[data-id="${data.gridId}"]`);
  const preview = document.getElementById('preview');
  
  if (grid && preview) {
    const children = Array.from(preview.children).filter(child => 
      child.tagName.toLowerCase() === 'r-grid'
    );
    const currentIndex = children.indexOf(grid);
    
    // If the grid needs to move up
    if (data.previousIndex > currentIndex) {
      // Find the grid that should be after our grid
      const targetIndex = Math.min(data.previousIndex, children.length - 1);
      const targetGrid = children[targetIndex];
      
      // Insert our grid before the target grid
      if (targetGrid) {
        preview.insertBefore(grid, targetGrid.nextSibling);
      } else {
        preview.appendChild(grid);
      }
    } 
    // If the grid needs to move down
    else if (data.previousIndex < currentIndex) {
      // Find the grid that should be before our grid
      const targetGrid = children[data.previousIndex];
      
      // Insert our grid before the target grid
      if (targetGrid) {
        preview.insertBefore(grid, targetGrid);
      } else {
        preview.prepend(grid);
      }
    }
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