// pageStyles.js

document.addEventListener("DOMContentLoaded", () => {
  // Get references to the page style modal elements
  const pageStyleModal = document.getElementById("pageStyleModal");
  const pageStyleModalClose = document.getElementById("pageStyleModalClose");
  const openPageStyleModalBtn = document.getElementById("open-page-style-modal");

  const pageBgColorSelect = document.getElementById("page-bg-color-select");
  const pageTextColorSelect = document.getElementById("page-text-color-select");
  const applyPageStyleBtn = document.getElementById("apply-page-style");
  
  // Color swatches
  const pageBgColorSwatches = document.querySelectorAll("#page-bg-color-swatches .color-swatch");
  const pageTextColorSwatches = document.querySelectorAll("#page-text-color-swatches .color-swatch");

  // Store page styling settings
  window.pageStyles = {
    backgroundColor: "",
    textColor: ""
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
    });
  });
  
  pageTextColorSwatches.forEach(swatch => {
    swatch.addEventListener("click", () => {
      pageTextColorSelect.value = swatch.dataset.color;
    });
  });

  // Fill the page style modal with current values
  function fillPageStyleModal() {
    pageBgColorSelect.value = window.pageStyles.backgroundColor || "";
    pageTextColorSelect.value = window.pageStyles.textColor || "";
  }

  // Apply the selected styles to the preview
  applyPageStyleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    
    // Store previous state for undo
    const previousBgColor = window.pageStyles.backgroundColor;
    const previousTextColor = window.pageStyles.textColor;
    
    // Update page styles
    window.pageStyles.backgroundColor = pageBgColorSelect.value;
    window.pageStyles.textColor = pageTextColorSelect.value;
    
    // Apply styles to the preview container
    const preview = document.getElementById("preview");
    
    // Remove previous background color classes
    preview.classList.forEach(cls => {
      if (cls.startsWith("bg-")) {
        preview.classList.remove(cls);
      }
    });
    
    // Remove previous text color classes
    preview.classList.forEach(cls => {
      if (cls.startsWith("text-")) {
        preview.classList.remove(cls);
      }
    });
    
    // Add new background color class if selected
    if (window.pageStyles.backgroundColor) {
      preview.classList.add(window.pageStyles.backgroundColor);
    }
    
    // Add new text color class if selected
    if (window.pageStyles.textColor) {
      preview.classList.add(window.pageStyles.textColor);
    }
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.UPDATE_PAGE_STYLE, {
      previousBgColor: previousBgColor,
      previousTextColor: previousTextColor,
      newBgColor: window.pageStyles.backgroundColor,
      newTextColor: window.pageStyles.textColor
    });

    pageStyleModal.style.display = "none";
  });
  
  // Prevent clicks inside the modal from propagating
  pageStyleModal.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});