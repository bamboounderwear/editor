// elements.js

document.addEventListener("DOMContentLoaded", () => {
  // Get references to the element–adding buttons.
  const addH1Btn = document.getElementById("add-h1");
  const addH2Btn = document.getElementById("add-h2");
  const addH3Btn = document.getElementById("add-h3");
  const addPBtn = document.getElementById("add-p");
  const addImgBtn = document.getElementById("add-img");

  // Helper: Ensure a cell is selected
  function requireCell() {
    if (!window.selectedCell) {
      alert("Please select a cell first.");
      return false;
    }
    return true;
  }

  // Add an editable element
  function addEditableElement(tagName, defaultText) {
    if (!requireCell()) return;
    const el = document.createElement(tagName);
    el.textContent = defaultText;
    el.classList.add("editable-element");

    // On click, remove selection from others, then select this one
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".editable-element").forEach(elem => {
        elem.classList.remove("selected-element");
      });
      window.selectedElement = el;
      el.classList.add("selected-element");
    });

    // Double-click for optional inline editing
    el.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      // For text (non-img), set contentEditable
      if (el.tagName.toLowerCase() !== "img") {
        el.contentEditable = "true";
        el.focus();
      }
    });
    el.addEventListener("blur", () => {
      el.contentEditable = "false";
    });

    window.selectedCell.appendChild(el);
  }

  // Add H1
  addH1Btn.addEventListener("click", () => {
    addEditableElement("h1", "Heading 1");
  });
  // Add H2
  addH2Btn.addEventListener("click", () => {
    addEditableElement("h2", "Heading 2");
  });
  // Add H3
  addH3Btn.addEventListener("click", () => {
    addEditableElement("h3", "Heading 3");
  });
  // Add Paragraph
  addPBtn.addEventListener("click", () => {
    addEditableElement("p", "Your paragraph text here...");
  });
  // Add Image
  addImgBtn.addEventListener("click", () => {
    if (!requireCell()) return;
    const url = prompt("Enter image URL:");
    if (url) {
      const img = document.createElement("img");
      img.src = url;
      img.style.maxWidth = "100%";
      img.classList.add("editable-element");

      // On click, select
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".editable-element").forEach(elem => {
          elem.classList.remove("selected-element");
        });
        window.selectedElement = img;
        img.classList.add("selected-element");
      });

      // Double-click to update URL
      img.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        const newUrl = prompt("Enter new image URL:", img.src);
        if (newUrl) {
          img.src = newUrl;
        }
      });
      window.selectedCell.appendChild(img);
    }
  });
});
