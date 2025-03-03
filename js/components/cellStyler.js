// cellStyler.js - Handles cell styling functionality

document.addEventListener("DOMContentLoaded", () => {
  // Get references to the cell style modal elements
  const cellStyleModal = document.getElementById("cellStyleModal");
  const cellStyleModalClose = document.getElementById("cellStyleModalClose");
  const styleCellBtn = document.getElementById("style-cell");

  const cellHeightSelect = document.getElementById("cell-height-select");
  const cellPaddingSelect = document.getElementById("cell-padding-select");
  const cellContentAlignSelect = document.getElementById("cell-content-align-select");
  const cellTextAlignSelect = document.getElementById("cell-text-align-select");
  const cellBgColorSelect = document.getElementById("cell-bg-color-select");
  const applyCellStyleBtn = document.getElementById("apply-cell-style");
  
  // Color swatches
  const bgColorSwatches = document.querySelectorAll("#bg-color-swatches .color-swatch");
  
  // Custom color elements
  const customBgColorContainer = document.getElementById("custom-bg-color-container");
  const customBgColorPicker = document.getElementById("custom-bg-color-picker");
  const customBgColorHex = document.getElementById("custom-bg-color-hex");

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
      customBgColorContainer.style.display = "none";
    });
  });
  
  // Show/hide custom color inputs based on color selection
  cellBgColorSelect.addEventListener("change", () => {
    if (cellBgColorSelect.value === "custom") {
      customBgColorContainer.style.display = "flex";
    } else {
      customBgColorContainer.style.display = "none";
    }
  });
  
  // Sync color picker with hex input
  customBgColorPicker.addEventListener("input", () => {
    customBgColorHex.value = customBgColorPicker.value;
  });
  
  // Validate and sync hex input with color picker
  customBgColorHex.addEventListener("input", () => {
    const hexValue = customBgColorHex.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      customBgColorPicker.value = hexValue;
    }
  });
  
  // Ensure hex input has # prefix
  customBgColorHex.addEventListener("blur", () => {
    let hexValue = customBgColorHex.value;
    if (hexValue.charAt(0) !== '#') {
      hexValue = '#' + hexValue;
    }
    
    // Use the utility function to validate hex color
    customBgColorHex.value = window.colorUtils.validateHexColor(hexValue, customBgColorPicker.value);
    customBgColorPicker.value = customBgColorHex.value;
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
    
    // Check content alignment (vertical)
    let contentAlignClass = "";
    if (cell.classList.contains("align-top")) contentAlignClass = "align-top";
    if (cell.classList.contains("align-middle")) contentAlignClass = "align-middle";
    if (cell.classList.contains("align-bottom")) contentAlignClass = "align-bottom";
    cellContentAlignSelect.value = contentAlignClass;
    
    // Check text alignment (horizontal)
    let textAlignClass = "";
    if (cell.classList.contains("text-left")) textAlignClass = "text-left";
    if (cell.classList.contains("text-center")) textAlignClass = "text-center";
    if (cell.classList.contains("text-right")) textAlignClass = "text-right";
    cellTextAlignSelect.value = textAlignClass;
    
    // Check background color
    let bgColorClass = "";
    customBgColorContainer.style.display = "none";
    
    // Check for predefined background color classes
    let hasPresetColor = false;
    cell.classList.forEach(cls => {
      if (cls.startsWith("bg-")) {
        bgColorClass = cls;
        hasPresetColor = true;
      }
    });
    cellBgColorSelect.value = bgColorClass;
    
    // Check for custom inline background color
    if (!hasPresetColor && cell.style.backgroundColor) {
      cellBgColorSelect.value = "custom";
      customBgColorContainer.style.display = "flex";
      const colorValue = cell.style.backgroundColor;
      
      // Convert RGB to HEX if needed using the utility function
      const hexColor = window.colorUtils.rgbToHex(colorValue);
      customBgColorPicker.value = hexColor;
      customBgColorHex.value = hexColor;
    }
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
    const previousStyle = cell.style.cssText;
    
    const heightVal = cellHeightSelect.value;
    const paddingVal = cellPaddingSelect.value;
    const contentAlignVal = cellContentAlignSelect.value;
    const textAlignVal = cellTextAlignSelect.value;
    const bgColorVal = cellBgColorSelect.value;

    // Use utility functions to apply styles
    window.styleUtils.applyCellHeight(cell, heightVal);
    window.styleUtils.applySpacing(cell, null, paddingVal);
    window.styleUtils.applyCellContentAlignment(cell, contentAlignVal);
    window.styleUtils.applyCellTextAlignment(cell, textAlignVal);
    window.styleUtils.applyBackgroundColor(cell, bgColorVal);
    
    // Apply custom background color if selected
    if (bgColorVal === "custom") {
      cell.style.backgroundColor = customBgColorHex.value;
    }
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.STYLE_CELL, {
      cellId: cell.getAttribute('data-id'),
      previousClasses: previousClasses,
      previousStyle: previousStyle,
      newClasses: cell.className,
      newStyle: cell.style.cssText
    });

    cellStyleModal.style.display = "none";
  });
  
  // Prevent clicks inside the modal from propagating
  cellStyleModal.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});