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
    // Validate hex format
    if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      customBgColorHex.value = hexValue;
      customBgColorPicker.value = hexValue;
    } else {
      // Reset to color picker value if invalid
      customBgColorHex.value = customBgColorPicker.value;
    }
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
      // Convert RGB to HEX if needed
      if (colorValue.startsWith("rgb")) {
        const rgb = colorValue.match(/\d+/g);
        if (rgb && rgb.length === 3) {
          const hex = "#" + rgb.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
          customBgColorPicker.value = hex;
          customBgColorHex.value = hex;
        }
      } else {
        customBgColorPicker.value = colorValue;
        customBgColorHex.value = colorValue;
      }
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
    
    // Clear any inline background color style
    cell.style.backgroundColor = '';
    
    // Apply the selected background color
    if (bgColorVal === "custom") {
      // Apply custom color as inline style
      const customColor = customBgColorHex.value;
      cell.style.backgroundColor = customColor;
    } else if (bgColorVal) {
      // Apply predefined color class
      cell.classList.add(bgColorVal);
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