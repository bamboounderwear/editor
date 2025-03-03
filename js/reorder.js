// reorder.js - Handles reordering of grids and elements

document.addEventListener("DOMContentLoaded", () => {
  // Initialize global variables
  window.reorderEnabled = true; // Flag to enable/disable reordering

  /**
   * Add movement controls to an element
   * @param {HTMLElement} element - The element to add controls to
   */
  function addMovementControls(element) {
    // Remove existing controls if any
    const existingControls = element.querySelector('.movement-controls');
    if (existingControls) {
      existingControls.remove();
    }

    // Create movement controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'movement-controls';
    
    // Create up button
    const upButton = document.createElement('button');
    upButton.className = 'move-up-btn';
    upButton.innerHTML = '&uarr;';
    upButton.title = 'Move Up';
    upButton.addEventListener('click', (e) => {
      e.stopPropagation();
      moveElementUp(element);
    });
    
    // Create down button
    const downButton = document.createElement('button');
    downButton.className = 'move-down-btn';
    downButton.innerHTML = '&darr;';
    downButton.title = 'Move Down';
    downButton.addEventListener('click', (e) => {
      e.stopPropagation();
      moveElementDown(element);
    });
    
    // Add buttons to container
    controlsContainer.appendChild(upButton);
    controlsContainer.appendChild(downButton);
    
    // Special handling for images since they can't have child elements
    if (element.tagName.toLowerCase() === 'img') {
      // Create a wrapper div if it doesn't exist
      let wrapper = element.parentNode;
      if (!wrapper.classList.contains('img-wrapper')) {
        // Create a new wrapper
        wrapper = document.createElement('div');
        wrapper.className = 'img-wrapper editable-element';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.maxWidth = '100%';
        
        // Copy the element's ID to the wrapper and generate a new one for the image
        if (element.hasAttribute('data-id')) {
          wrapper.setAttribute('data-id', element.getAttribute('data-id'));
          element.setAttribute('data-id', window.historyManager.generateUniqueId());
        }
        
        // Insert the wrapper in the DOM
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
        
        // Remove editable-element class from image and add it to wrapper
        element.classList.remove('editable-element', 'selected-element');
        
        // Transfer click event to wrapper
        wrapper.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll(".editable-element").forEach(elem => {
            elem.classList.remove("selected-element");
          });
          window.selectedElement = wrapper;
          wrapper.classList.add("selected-element");
          document.getElementById('delete-element').disabled = false;
          document.getElementById('open-style-modal').disabled = false;
        });
        
        // Add the controls to the wrapper instead of the image
        wrapper.appendChild(controlsContainer);
        return;
      } else {
        // If wrapper already exists, add controls to it
        wrapper.appendChild(controlsContainer);
        return;
      }
    }
    
    // For non-image elements, add controls directly
    element.appendChild(controlsContainer);
  }

  /**
   * Add movement controls to a grid
   * @param {HTMLElement} grid - The grid to add controls to
   */
  function addGridMovementControls(grid) {
    // Check if controls already exist
    if (grid.querySelector('.grid-movement-controls')) {
      return;
    }

    // Create movement controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'grid-movement-controls';
    
    // Create up button
    const upButton = document.createElement('button');
    upButton.className = 'move-up-btn';
    upButton.innerHTML = '&uarr;';
    upButton.title = 'Move Grid Up';
    upButton.addEventListener('click', (e) => {
      e.stopPropagation();
      moveGridUp(grid);
    });
    
    // Create down button
    const downButton = document.createElement('button');
    downButton.className = 'move-down-btn';
    downButton.innerHTML = '&darr;';
    downButton.title = 'Move Grid Down';
    downButton.addEventListener('click', (e) => {
      e.stopPropagation();
      moveGridDown(grid);
    });
    
    // Add buttons to container
    controlsContainer.appendChild(upButton);
    controlsContainer.appendChild(downButton);
    
    // Add container to grid
    grid.appendChild(controlsContainer);
  }

  /**
   * Move an element up within its parent
   * @param {HTMLElement} element - The element to move
   */
  function moveElementUp(element) {
    const parent = element.parentNode;
    const prev = element.previousElementSibling;
    
    // Can't move up if it's the first element
    if (!prev) return;
    
    // Store previous state for undo
    const elementId = element.getAttribute('data-id');
    const cellId = parent.getAttribute('data-id');
    const previousIndex = Array.from(parent.children).indexOf(element);
    
    // Move the element
    parent.insertBefore(element, prev);
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.REORDER_ELEMENT, {
      elementId: elementId,
      cellId: cellId,
      previousIndex: previousIndex,
      newIndex: previousIndex - 1
    });
  }

  /**
   * Move an element down within its parent
   * @param {HTMLElement} element - The element to move
   */
  function moveElementDown(element) {
    const parent = element.parentNode;
    const next = element.nextElementSibling;
    
    // Can't move down if it's the last element
    if (!next) return;
    
    // Store previous state for undo
    const elementId = element.getAttribute('data-id');
    const cellId = parent.getAttribute('data-id');
    const previousIndex = Array.from(parent.children).indexOf(element);
    
    // Move the element
    parent.insertBefore(next, element);
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.REORDER_ELEMENT, {
      elementId: elementId,
      cellId: cellId,
      previousIndex: previousIndex,
      newIndex: previousIndex + 1
    });
  }

  /**
   * Move a grid up within the preview
   * @param {HTMLElement} grid - The grid to move
   */
  function moveGridUp(grid) {
    const preview = document.getElementById('preview');
    const prev = grid.previousElementSibling;
    
    // Can't move up if it's the first grid or if the previous element is not a grid
    if (!prev || prev.tagName.toLowerCase() !== 'r-grid') return;
    
    // Store previous state for undo
    const gridId = grid.getAttribute('data-id');
    const previousIndex = Array.from(preview.children).indexOf(grid);
    
    // Move the grid
    preview.insertBefore(grid, prev);
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.REORDER_GRID, {
      gridId: gridId,
      previousIndex: previousIndex,
      newIndex: previousIndex - 1
    });
  }

  /**
   * Move a grid down within the preview
   * @param {HTMLElement} grid - The grid to move
   */
  function moveGridDown(grid) {
    const preview = document.getElementById('preview');
    const next = grid.nextElementSibling;
    
    // Can't move down if it's the last grid or if the next element is not a grid
    if (!next || next.tagName.toLowerCase() !== 'r-grid') return;
    
    // Store previous state for undo
    const gridId = grid.getAttribute('data-id');
    const previousIndex = Array.from(preview.children).indexOf(grid);
    
    // Move the grid
    preview.insertBefore(next, grid);
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.REORDER_GRID, {
      gridId: gridId,
      previousIndex: previousIndex,
      newIndex: previousIndex + 1
    });
  }

  // Make functions available globally
  window.reorderUtils = {
    addMovementControls,
    addGridMovementControls,
    moveElementUp,
    moveElementDown,
    moveGridUp,
    moveGridDown
  };
});