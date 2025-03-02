// styleControls.js

document.addEventListener("DOMContentLoaded", () => {
  // Get references to the style modal elements
  const styleModal = document.getElementById("styleModal");
  const styleModalClose = document.getElementById("styleModalClose");
  const openStyleModalBtn = document.getElementById("open-style-modal");

  const contentInput = document.getElementById("content-input");
  const typographySelect = document.getElementById("typography-select");
  const sizeClassSelect = document.getElementById("size-class-select");
  const alignSelect = document.getElementById("align-select");
  const textColorSelect = document.getElementById("text-color-select");
  const marginSelect = document.getElementById("margin-select");
  const paddingSelect = document.getElementById("padding-select");
  const applyStyleBtn = document.getElementById("apply-style");
  
  // Color swatches
  const textColorSwatches = document.querySelectorAll("#text-color-swatches .color-swatch");
  
  // Custom color elements
  const customTextColorContainer = document.getElementById("custom-text-color-container");
  const customTextColorPicker = document.getElementById("custom-text-color-picker");
  const customTextColorHex = document.getElementById("custom-text-color-hex");

  // Open the style modal when the button is clicked
  openStyleModalBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!window.selectedElement) {
      alert("Please select an element first.");
      return;
    }
    fillStyleModal(window.selectedElement);
    styleModal.style.display = "flex";
  });

  // Close the style modal when the X is clicked
  styleModalClose.addEventListener("click", () => {
    styleModal.style.display = "none";
  });

  // Close the style modal when clicking outside of it
  window.addEventListener("click", (e) => {
    if (e.target === styleModal) {
      styleModal.style.display = "none";
    }
  });

  // Show/hide size class select based on typography selection
  typographySelect.addEventListener("change", () => {
    const isH1 = typographySelect.value === "h1";
    document.getElementById("size-class-container").style.display = isH1 ? "block" : "none";
  });
  
  // Add click handlers for color swatches
  textColorSwatches.forEach(swatch => {
    swatch.addEventListener("click", () => {
      textColorSelect.value = swatch.dataset.color;
      customTextColorContainer.style.display = "none";
    });
  });
  
  // Show/hide custom color inputs based on color selection
  textColorSelect.addEventListener("change", () => {
    if (textColorSelect.value === "custom") {
      customTextColorContainer.style.display = "flex";
    } else {
      customTextColorContainer.style.display = "none";
    }
  });
  
  // Sync color picker with hex input
  customTextColorPicker.addEventListener("input", () => {
    customTextColorHex.value = customTextColorPicker.value;
  });
  
  // Validate and sync hex input with color picker
  customTextColorHex.addEventListener("input", () => {
    const hexValue = customTextColorHex.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      customTextColorPicker.value = hexValue;
    }
  });
  
  // Ensure hex input has # prefix
  customTextColorHex.addEventListener("blur", () => {
    let hexValue = customTextColorHex.value;
    if (hexValue.charAt(0) !== '#') {
      hexValue = '#' + hexValue;
    }
    // Validate hex format
    if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      customTextColorHex.value = hexValue;
      customTextColorPicker.value = hexValue;
    } else {
      // Reset to color picker value if invalid
      customTextColorHex.value = customTextColorPicker.value;
    }
  });

  // Fill the style modal with the selected element's current values
  function fillStyleModal(el) {
    if (el.tagName.toLowerCase() === "img") {
      contentInput.value = el.src || "";
    } else {
      contentInput.value = el.textContent || "";
    }
    
    const tag = el.tagName.toLowerCase();
    if (["h1", "h2", "h3", "p", "button", "small", "xsmall"].includes(tag)) {
      typographySelect.value = tag;
    } else {
      typographySelect.value = "";
    }
    
    // Show/hide size class select based on element type
    const isH1 = tag === "h1";
    document.getElementById("size-class-container").style.display = isH1 ? "block" : "none";
    
    // Check for size classes
    sizeClassSelect.value = "";
    if (el.classList.contains("large")) sizeClassSelect.value = "large";
    if (el.classList.contains("xlarge")) sizeClassSelect.value = "xlarge";
    if (el.classList.contains("xxlarge")) sizeClassSelect.value = "xxlarge";
    if (el.classList.contains("xxxlarge")) sizeClassSelect.value = "xxxlarge";
    
    // Check alignment
    let alignment = "";
    if (el.classList.contains("left")) alignment = "left";
    if (el.classList.contains("center")) alignment = "center";
    if (el.classList.contains("right")) alignment = "right";
    alignSelect.value = alignment;
    
    // Check text color
    textColorSelect.value = "";
    customTextColorContainer.style.display = "none";
    
    // Check for predefined text color classes
    let hasPresetColor = false;
    el.classList.forEach(cls => {
      if (cls.startsWith("text-")) {
        textColorSelect.value = cls;
        hasPresetColor = true;
      }
    });
    
    // Check for custom inline color
    if (!hasPresetColor && el.style.color) {
      textColorSelect.value = "custom";
      customTextColorContainer.style.display = "flex";
      const colorValue = el.style.color;
      // Convert RGB to HEX if needed
      if (colorValue.startsWith("rgb")) {
        const rgb = colorValue.match(/\d+/g);
        if (rgb && rgb.length === 3) {
          const hex = "#" + rgb.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
          customTextColorPicker.value = hex;
          customTextColorHex.value = hex;
        }
      } else {
        customTextColorPicker.value = colorValue;
        customTextColorHex.value = colorValue;
      }
    }

    // Check margin and padding
    marginSelect.value = "";
    paddingSelect.value = "";
    el.classList.forEach(cls => {
      if (cls.startsWith("margin")) marginSelect.value = cls;
      if (cls.startsWith("padding")) paddingSelect.value = cls;
    });
  }

  // Apply the selected styles to the element
  applyStyleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!window.selectedElement) {
      alert("No element selected for styling.");
      return;
    }
    
    const el = window.selectedElement;
    
    // Store previous state for undo
    const previousContent = el.tagName.toLowerCase() === "img" ? el.src : el.textContent;
    const previousClasses = el.className;
    const previousStyle = el.style.cssText;
    
    const contentVal = contentInput.value;
    const typographyVal = typographySelect.value;
    const sizeClassVal = sizeClassSelect.value;
    const alignVal = alignSelect.value;
    const textColorVal = textColorSelect.value;
    const marginVal = marginSelect.value;
    const paddingVal = paddingSelect.value;

    // Update content
    if (el.tagName.toLowerCase() === "img") {
      el.src = contentVal;
    } else {
      el.textContent = contentVal;
    }
    
    // If typography changes, replace the element
    if (typographyVal && typographyVal !== el.tagName.toLowerCase()) {
      const newEl = document.createElement(typographyVal);
      const elementId = window.historyManager.generateUniqueId();
      newEl.setAttribute('data-id', elementId);
      
      if (typographyVal === "img") {
        newEl.src = contentVal;
        newEl.style.maxWidth = "100%";
      } else if (typographyVal === "button") {
        newEl.textContent = contentVal;
        newEl.style.padding = "8px 16px";
        newEl.style.backgroundColor = "#000000";
        newEl.style.color = "white";
        newEl.style.border = "none";
        newEl.style.borderRadius = "4px";
        newEl.style.cursor = "pointer";
        newEl.style.fontSize = "1rem";
        newEl.style.fontWeight = "500";
      } else {
        newEl.textContent = contentVal;
      }
      newEl.style.cssText = el.style.cssText;
      newEl.className = el.className;
      newEl.classList.add("editable-element");
      
      // Add event listeners to the new element
      window.addElementEventListeners(newEl);
      
      // Replace the element
      el.parentNode.replaceChild(newEl, el);
      window.selectedElement = newEl;
      
      // Add to history
      window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.STYLE_ELEMENT, {
        elementId: elementId,
        previousElementId: el.getAttribute('data-id'),
        previousContent: previousContent,
        previousClasses: previousClasses,
        previousStyle: previousStyle,
        newContent: contentVal,
        newClasses: newEl.className,
        newStyle: newEl.style.cssText
      });
    } else {
      // Update size classes (only for h1)
      if (window.selectedElement.tagName.toLowerCase() === "h1") {
        window.selectedElement.classList.remove("large", "xlarge", "xxlarge", "xxxlarge");
        if (sizeClassVal) {
          window.selectedElement.classList.add(sizeClassVal);
        }
      }
      
      // Update alignment
      window.selectedElement.classList.remove("left", "center", "right");
      if (alignVal) {
        window.selectedElement.classList.add(alignVal);
      }
      
      // Update text color
      window.selectedElement.classList.forEach(cls => {
        if (cls.startsWith("text-")) {
          window.selectedElement.classList.remove(cls);
        }
      });
      
      // Clear any inline color style
      window.selectedElement.style.color = '';
      
      // Apply the selected color
      if (textColorVal === "custom") {
        // Apply custom color as inline style
        const customColor = customTextColorHex.value;
        window.selectedElement.style.color = customColor;
      } else if (textColorVal) {
        // Apply predefined color class
        window.selectedElement.classList.add(textColorVal);
      }
      
      // Update margin and padding
      window.selectedElement.classList.forEach(cls => {
        if (cls.startsWith("margin") || cls.startsWith("padding")) {
          window.selectedElement.classList.remove(cls);
        }
      });
      if (marginVal) window.selectedElement.classList.add(marginVal);
      if (paddingVal) window.selectedElement.classList.add(paddingVal);
      
      // Add to history
      window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.STYLE_ELEMENT, {
        elementId: window.selectedElement.getAttribute('data-id'),
        previousContent: previousContent,
        previousClasses: previousClasses,
        previousStyle: previousStyle,
        newContent: contentVal,
        newClasses: window.selectedElement.className,
        newStyle: window.selectedElement.style.cssText
      });
    }

    styleModal.style.display = "none";
  });
  
  // Prevent clicks inside the modal from propagating
  styleModal.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});