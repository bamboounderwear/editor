// pageStyler.js - Handles page-wide styling functionality

document.addEventListener("DOMContentLoaded", () => {
  // Get references to the page style modal elements
  const pageStyleModal = document.getElementById("pageStyleModal");
  const pageStyleModalClose = document.getElementById("pageStyleModalClose");
  const openPageStyleModalBtn = document.getElementById("open-page-style-modal");

  const pageBgColorSelect = document.getElementById("page-bg-color-select");
  const pageTextColorSelect = document.getElementById("page-text-color-select");
  const pageFontSizeSelect = document.getElementById("page-font-size-select");
  const headingFontSelect = document.getElementById("heading-font-select");
  const headingWeightSelect = document.getElementById("heading-weight-select");
  const bodyFontSelect = document.getElementById("body-font-select");
  const bodyWeightSelect = document.getElementById("body-weight-select");
  const containerWidthSelect = document.getElementById("container-width-select");
  const applyPageStyleBtn = document.getElementById("apply-page-style");
  
  // Color swatches
  const pageBgColorSwatches = document.querySelectorAll("#page-bg-color-swatches .color-swatch");
  const pageTextColorSwatches = document.querySelectorAll("#page-text-color-swatches .color-swatch");
  
  // Custom color elements
  const customPageBgColorContainer = document.getElementById("custom-page-bg-color-container");
  const customPageBgColorPicker = document.getElementById("custom-page-bg-color-picker");
  const customPageBgColorHex = document.getElementById("custom-page-bg-color-hex");
  
  const customPageTextColorContainer = document.getElementById("custom-page-text-color-container");
  const customPageTextColorPicker = document.getElementById("custom-page-text-color-picker");
  const customPageTextColorHex = document.getElementById("custom-page-text-color-hex");

  // Store page styling settings
  window.pageStyles = window.pageStyles || {
    backgroundColor: "",
    textColor: "",
    customBgColor: "",
    customTextColor: "",
    fontSize: "",
    headingFont: "",
    headingWeight: "",
    bodyFont: "",
    bodyWeight: "",
    containerWidth: ""
  };

  // Open the page style modal when the button is clicked
  openPageStyleModalBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fillPageStyleModal();
    pageStyleModal.style.display = "flex";
  });

  // Close the page style modal when the X is clicked
  pageStyleModalClose.addEventListener("click", () => {
    pageStyleModal.style.display = "none";
  });

  // Close the page style modal when clicking outside of it
  window.addEventListener("click", (e) => {
    if (e.target === pageStyleModal) {
      pageStyleModal.style.display = "none";
    }
  });
  
  // Add click handlers for color swatches
  pageBgColorSwatches.forEach(swatch => {
    swatch.addEventListener("click", () => {
      pageBgColorSelect.value = swatch.dataset.color;
      customPageBgColorContainer.style.display = "none";
    });
  });
  
  pageTextColorSwatches.forEach(swatch => {
    swatch.addEventListener("click", () => {
      pageTextColorSelect.value = swatch.dataset.color;
      customPageTextColorContainer.style.display = "none";
    });
  });
  
  // Show/hide custom color inputs based on color selection
  pageBgColorSelect.addEventListener("change", () => {
    if (pageBgColorSelect.value === "custom") {
      customPageBgColorContainer.style.display = "flex";
    } else {
      customPageBgColorContainer.style.display = "none";
    }
  });
  
  pageTextColorSelect.addEventListener("change", () => {
    if (pageTextColorSelect.value === "custom") {
      customPageTextColorContainer.style.display = "flex";
    } else {
      customPageTextColorContainer.style.display = "none";
    }
  });
  
  // Sync color pickers with hex inputs
  customPageBgColorPicker.addEventListener("input", () => {
    customPageBgColorHex.value = customPageBgColorPicker.value;
  });
  
  customPageTextColorPicker.addEventListener("input", () => {
    customPageTextColorHex.value = customPageTextColorPicker.value;
  });
  
  // Validate and sync hex inputs with color pickers
  customPageBgColorHex.addEventListener("input", () => {
    const hexValue = customPageBgColorHex.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      customPageBgColorPicker.value = hexValue;
    }
  });
  
  customPageTextColorHex.addEventListener("input", () => {
    const hexValue = customPageTextColorHex.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      customPageTextColorPicker.value = hexValue;
    }
  });
  
  // Ensure hex inputs have # prefix
  customPageBgColorHex.addEventListener("blur", () => {
    let hexValue = customPageBgColorHex.value;
    if (hexValue.charAt(0) !== '#') {
      hexValue = '#' + hexValue;
    }
    
    // Use the utility function to validate hex color
    customPageBgColorHex.value = window.colorUtils.validateHexColor(hexValue, customPageBgColorPicker.value);
    customPageBgColorPicker.value = customPageBgColorHex.value;
  });
  
  customPageTextColorHex.addEventListener("blur", () => {
    let hexValue = customPageTextColorHex.value;
    if (hexValue.charAt(0) !== '#') {
      hexValue = '#' + hexValue;
    }
    
    // Use the utility function to validate hex color
    customPageTextColorHex.value = window.colorUtils.validateHexColor(hexValue, customPageTextColorPicker.value);
    customPageTextColorPicker.value = customPageTextColorHex.value;
  });

  // Fill the page style modal with current values
  function fillPageStyleModal() {
    // Set background color
    if (window.pageStyles.backgroundColor === "custom") {
      pageBgColorSelect.value = "custom";
      customPageBgColorContainer.style.display = "flex";
      customPageBgColorPicker.value = window.pageStyles.customBgColor || "#ffffff";
      customPageBgColorHex.value = window.pageStyles.customBgColor || "#ffffff";
    } else {
      pageBgColorSelect.value = window.pageStyles.backgroundColor || "";
      customPageBgColorContainer.style.display = "none";
    }
    
    // Set text color
    if (window.pageStyles.textColor === "custom") {
      pageTextColorSelect.value = "custom";
      customPageTextColorContainer.style.display = "flex";
      customPageTextColorPicker.value = window.pageStyles.customTextColor || "#000000";
      customPageTextColorHex.value = window.pageStyles.customTextColor || "#000000";
    } else {
      pageTextColorSelect.value = window.pageStyles.textColor || "";
      customPageTextColorContainer.style.display = "none";
    }
    
    // Set other values
    pageFontSizeSelect.value = window.pageStyles.fontSize || "";
    headingFontSelect.value = window.pageStyles.headingFont || "";
    headingWeightSelect.value = window.pageStyles.headingWeight || "";
    bodyFontSelect.value = window.pageStyles.bodyFont || "";
    bodyWeightSelect.value = window.pageStyles.bodyWeight || "";
    containerWidthSelect.value = window.pageStyles.containerWidth || "";
  }

  // Apply the selected styles to the preview
  applyPageStyleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    
    // Store previous state for undo
    const previousBgColor = window.pageStyles.backgroundColor;
    const previousTextColor = window.pageStyles.textColor;
    const previousCustomBgColor = window.pageStyles.customBgColor;
    const previousCustomTextColor = window.pageStyles.customTextColor;
    const previousFontSize = window.pageStyles.fontSize;
    const previousHeadingFont = window.pageStyles.headingFont;
    const previousHeadingWeight = window.pageStyles.headingWeight;
    const previousBodyFont = window.pageStyles.bodyFont;
    const previousBodyWeight = window.pageStyles.bodyWeight;
    const previousContainerWidth = window.pageStyles.containerWidth;
    
    // Update page styles
    window.pageStyles.backgroundColor = pageBgColorSelect.value;
    window.pageStyles.textColor = pageTextColorSelect.value;
    
    // Store custom colors if selected
    if (pageBgColorSelect.value === "custom") {
      window.pageStyles.customBgColor = customPageBgColorHex.value;
    }
    
    if (pageTextColorSelect.value === "custom") {
      window.pageStyles.customTextColor = customPageTextColorHex.value;
    }
    
    window.pageStyles.fontSize = pageFontSizeSelect.value;
    window.pageStyles.headingFont = headingFontSelect.value;
    window.pageStyles.headingWeight = headingWeightSelect.value;
    window.pageStyles.bodyFont = bodyFontSelect.value;
    window.pageStyles.bodyWeight = bodyWeightSelect.value;
    window.pageStyles.containerWidth = containerWidthSelect.value;
    
    // Apply styles to the preview container only
    const preview = document.getElementById("preview");
    
    // Remove previous classes
    removePageStyleClasses(preview);
    
    // Apply new background color
    if (window.pageStyles.backgroundColor === "custom") {
      preview.style.backgroundColor = window.pageStyles.customBgColor;
    } else if (window.pageStyles.backgroundColor) {
      preview.classList.add(window.pageStyles.backgroundColor);
    }
    
    // Apply new text color
    if (window.pageStyles.textColor === "custom") {
      preview.style.color = window.pageStyles.customTextColor;
    } else if (window.pageStyles.textColor) {
      preview.classList.add(window.pageStyles.textColor);
    }
    
    // Add new font size class if selected and apply the actual font size to the preview
    if (window.pageStyles.fontSize) {
      preview.classList.add(window.pageStyles.fontSize);
      applyFontSizeVariable(preview, window.pageStyles.fontSize);
    } else {
      // Reset to default font size
      resetFontSizeVariable(preview);
    }
    
    // Add new font classes
    if (window.pageStyles.headingFont) preview.classList.add(window.pageStyles.headingFont);
    if (window.pageStyles.headingWeight) preview.classList.add(window.pageStyles.headingWeight);
    if (window.pageStyles.bodyFont) preview.classList.add(window.pageStyles.bodyFont);
    if (window.pageStyles.bodyWeight) preview.classList.add(window.pageStyles.bodyWeight);
    if (window.pageStyles.containerWidth) preview.classList.add(window.pageStyles.containerWidth);
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.UPDATE_PAGE_STYLE, {
      previousBgColor: previousBgColor,
      previousTextColor: previousTextColor,
      previousCustomBgColor: previousCustomBgColor,
      previousCustomTextColor: previousCustomTextColor,
      previousFontSize: previousFontSize,
      previousHeadingFont: previousHeadingFont,
      previousHeadingWeight: previousHeadingWeight,
      previousBodyFont: previousBodyFont,
      previousBodyWeight: previousBodyWeight,
      previousContainerWidth: previousContainerWidth,
      newBgColor: window.pageStyles.backgroundColor,
      newTextColor: window.pageStyles.textColor,
      newCustomBgColor: window.pageStyles.customBgColor,
      newCustomTextColor: window.pageStyles.customTextColor,
      newFontSize: window.pageStyles.fontSize,
      newHeadingFont: window.pageStyles.headingFont,
      newHeadingWeight: window.pageStyles.headingWeight,
      newBodyFont: window.pageStyles.bodyFont,
      newBodyWeight: window.pageStyles.bodyWeight,
      newContainerWidth: window.pageStyles.containerWidth
    });

    pageStyleModal.style.display = "none";
    
    // Apply the font styles by adding the necessary Google Fonts
    updateGoogleFonts();
  });
  
  // Helper function to remove all page style classes
  function removePageStyleClasses(element) {
    // Remove background color classes and styles
    element.classList.forEach(cls => {
      if (cls.startsWith("bg-")) {
        element.classList.remove(cls);
      }
    });
    element.style.backgroundColor = '';
    
    // Remove text color classes and styles
    element.classList.forEach(cls => {
      if (cls.startsWith("text-")) {
        element.classList.remove(cls);
      }
    });
    element.style.color = '';
    
    // Remove font size classes
    element.classList.forEach(cls => {
      if (cls.startsWith("font-size-")) {
        element.classList.remove(cls);
      }
    });
    
    // Remove font family classes
    element.classList.forEach(cls => {
      if (cls.startsWith("heading-font-") || 
          cls.startsWith("heading-weight-") || 
          cls.startsWith("body-font-") || 
          cls.startsWith("body-weight-") || 
          cls.startsWith("container-")) {
        element.classList.remove(cls);
      }
    });
  }
  
  // Helper function to apply font size variable
  function applyFontSizeVariable(element, fontSizeClass) {
    const fontSize = fontSizeClass.replace('font-size-', '');
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
    element.style.setProperty('--fontSize', fontSizeValue);
    
    // Apply the font size to all r-grid elements within the preview
    // This is necessary because r-grid elements inherit --fontSize from :root, not from their parent
    const grids = element.querySelectorAll('r-grid');
    grids.forEach(grid => {
      grid.style.setProperty('--fontSize', fontSizeValue);
    });
    
    // Also set on document.documentElement to ensure proper inheritance
    // but ONLY for the preview area
    document.documentElement.style.setProperty('--preview-fontSize', fontSizeValue);
  }
  
  // Helper function to reset font size variable
  function resetFontSizeVariable(element) {
    // Reset on the preview element
    element.style.removeProperty('--fontSize');
    
    // Reset on all r-grid elements
    const grids = element.querySelectorAll('r-grid');
    grids.forEach(grid => {
      grid.style.removeProperty('--fontSize');
    });
    
    // Reset on document.documentElement
    document.documentElement.style.removeProperty('--preview-fontSize');
  }
  
  // Prevent clicks inside the modal from propagating
  pageStyleModal.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  
  // Make helper functions available globally
  window.pageStylerUtils = {
    applyFontSizeVariable,
    resetFontSizeVariable,
    removePageStyleClasses
  };
});

// Function to update Google Fonts based on selected fonts
function updateGoogleFonts() {
  // Remove any existing Google Font links
  document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => {
    if (link.href !== 'https://rsms.me/inter/inter.css') {
      link.remove();
    }
  });
  
  // Create a set of fonts to load
  const fontsToLoad = new Set();
  
  // Add heading font if selected
  if (window.pageStyles.headingFont && window.pageStyles.headingFont !== 'heading-font-inter') {
    const fontName = window.pageStyles.headingFont.replace('heading-font-', '');
    fontsToLoad.add(fontName);
  }
  
  // Add body font if selected
  if (window.pageStyles.bodyFont && window.pageStyles.bodyFont !== 'body-font-inter') {
    const fontName = window.pageStyles.bodyFont.replace('body-font-', '');
    fontsToLoad.add(fontName);
  }
  
  // Create font links for each font
  fontsToLoad.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    // Convert font name to proper format for Google Fonts URL
    const formattedFont = font.charAt(0).toUpperCase() + font.slice(1);
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(link);
  });
}

// Make updateGoogleFonts available globally
window.updateGoogleFonts = updateGoogleFonts;