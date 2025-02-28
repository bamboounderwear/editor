// cellStyles.js

document.addEventListener("DOMContentLoaded", () => {
  // Get references to the cell style modal elements
  const cellStyleModal = document.getElementById("cellStyleModal");
  const cellStyleModalClose = document.getElementById("cellStyleModalClose");
  const styleCellBtn = document.getElementById("style-cell");

  const cellHeightSelect = document.getElementById("cell-height-select");
  const cellPaddingSelect = document.getElementById("cell-padding-select");
  const cellBgColorSelect = document.getElementById("cell-bg-color-select");
  const applyCellStyleBtn = document.getElementById("apply-cell-style");
  
  // Color swatches
  const bgColorSwatches = document.querySelectorAll("#bg-color-swatches .color-swatch");

  // Open the cell style modal when the button is clicked
  styleCellBtn.addEventListener("click", (e) => {
    // Stop event propagation to prevent deselection
    e.stopPropagation();
    
    if (!window.selectedCell) {
      alert("Please select a cell first.");
      return;
    }
    fillCellStyleModal(window.selectedCell);
    cellStyleModal.style.display = "flex";
  });

  // Close the cell style modal when the X is clicked
  cellStyleModalClose.addEventListener("click", () => {
    cellStyleModal.style.display = "none";
  });

  // Close the cell style modal when clicking outside of it
  window.addEventListener("click", (e) => {
    if (e.target === cellStyleModal) {
      cellStyleModal.style.display = "none";
    }
  });
  
  // Add click handlers for color swatches
  bgColorSwatches.forEach(swatch => {
    swatch.addEventListener("click", () => {
      cellBgColorSelect.value = swatch.dataset.color;
    });
  });

  // Fill the cell style modal with the selected cell's current values
  function fillCellStyleModal(cell) {
    // Check for height class
    let heightClass = "";
    for (let i = 1; i <= 40; i++) {
      if (cell.classList.contains(`h-${i}`)) {
        heightClass = `h-${i}`;
        break;
      }
    }
    cellHeightSelect.value = heightClass;

    // Check padding
    let paddingClass = "";
    cell.classList.forEach(cls => {
      if (cls.startsWith("padding")) paddingClass = cls;
    });
    cellPaddingSelect.value = paddingClass;
    
    // Check background color
    let bgColorClass = "";
    cell.classList.forEach(cls => {
      if (cls.startsWith("bg-")) bgColorClass = cls;
    });
    cellBgColorSelect.value = bgColorClass;
  }

  // Apply the selected styles to the cell
  applyCellStyleBtn.addEventListener("click", (e) => {
    // Stop event propagation to prevent deselection
    e.stopPropagation();
    
    if (!window.selectedCell) {
      alert("No cell selected for styling.");
      return;
    }
    
    const cell = window.selectedCell;
    
    // Store previous state for undo
    const previousClasses = cell.className;
    
    const heightVal = cellHeightSelect.value;
    const paddingVal = cellPaddingSelect.value;
    const bgColorVal = cellBgColorSelect.value;

    // Remove existing height classes
    for (let i = 1; i <= 40; i++) {
      cell.classList.remove(`h-${i}`);
    }
    
    // Add new height class if selected
    if (heightVal) {
      cell.classList.add(heightVal);
    }
    
    // Update padding
    cell.classList.forEach(cls => {
      if (cls.startsWith("padding")) {
        cell.classList.remove(cls);
      }
    });
    if (paddingVal) cell.classList.add(paddingVal);
    
    // Update background color
    cell.classList.forEach(cls => {
      if (cls.startsWith("bg-")) {
        cell.classList.remove(cls);
      }
    });
    if (bgColorVal) cell.classList.add(bgColorVal);
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.STYLE_CELL, {
      cellId: cell.getAttribute('data-id'),
      previousClasses: previousClasses,
      newClasses: cell.className
    });

    cellStyleModal.style.display = "none";
  });
  
  // Prevent clicks inside the modal from propagating
  cellStyleModal.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});