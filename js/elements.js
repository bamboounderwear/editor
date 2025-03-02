// elements.js - Handles element creation and management

document.addEventListener("DOMContentLoaded", () => {
  // Get references to the element–adding buttons.
  const addH1Btn = document.getElementById("add-h1");
  const addH2Btn = document.getElementById("add-h2");
  const addH3Btn = document.getElementById("add-h3");
  const addPBtn = document.getElementById("add-p");
  const addImgBtn = document.getElementById("add-img");
  const addButtonBtn = document.getElementById("add-button");
  const addListBtn = document.getElementById("add-list");
  const addTaskListBtn = document.getElementById("add-task-list");
  const addDividerBtn = document.getElementById("add-divider");
  const addCodeBtn = document.getElementById("add-code");
  const deleteElementBtn = document.getElementById("delete-element");
  const openStyleModalBtn = document.getElementById("open-style-modal");

  // Helper: Ensure a cell is selected
  function requireCell() {
    if (!window.selectedCell) {
      alert("Please select a cell first.");
      return false;
    }
    return true;
  }

  // Add event listeners to an element
  function addElementEventListeners(el) {
    // On click, select this element for styling
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".editable-element").forEach(elem => {
        elem.classList.remove("selected-element");
      });
      window.selectedElement = el;
      el.classList.add("selected-element");
      deleteElementBtn.disabled = false;
      openStyleModalBtn.disabled = false;
    });
    
    // Double-click for optional inline editing
    if (el.tagName.toLowerCase() !== "img" && el.tagName.toLowerCase() !== "hr") {
      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        el.contentEditable = "true";
        el.focus();
      });
      el.addEventListener("blur", () => {
        el.contentEditable = "false";
      });
    }
  }

  // Add an editable element
  function addEditableElement(tagName, defaultText) {
    if (!requireCell()) return;
    
    // Ensure we're using the correct selected cell
    const targetCell = window.selectedCell;
    if (!targetCell) {
      alert("No cell selected. Please select a cell first.");
      return;
    }
    
    const el = document.createElement(tagName);
    const elementId = window.historyManager.generateUniqueId();
    el.setAttribute('data-id', elementId);
    
    if (tagName.toLowerCase() !== "img") {
      el.textContent = defaultText;
      
      // Add special styling for buttons
      if (tagName.toLowerCase() === "button") {
        el.style.padding = "8px 16px";
        el.style.backgroundColor = "#000000";
        el.style.color = "white";
        el.style.border = "none";
        el.style.borderRadius = "0px";
        el.style.cursor = "pointer";
        el.style.fontSize = "1rem";
        el.style.fontWeight = "500";
      }
    } else {
      el.src = defaultText;
      el.style.maxWidth = "100%";
    }
    el.classList.add("editable-element");

    // Add event listeners
    addElementEventListeners(el);
    
    // Remove the temporary padding from the cell when adding an element
    if (targetCell.style.padding === '10px') {
      targetCell.style.padding = '';
    }
    
    targetCell.appendChild(el);
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.ADD_ELEMENT, {
      elementId: elementId,
      cellId: targetCell.getAttribute('data-id'),
      tagName: tagName,
      content: defaultText
    });
    
    return el;
  }

  // Add H1
  addH1Btn.addEventListener("click", () => {
    addEditableElement("h1", "San Francisco Bubblegum");
  });
  // Add H2
  addH2Btn.addEventListener("click", () => {
    addEditableElement("h2", "Don Draper's Ideas");
  });
  // Add H3
  addH3Btn.addEventListener("click", () => {
    addEditableElement("h3", "VHS Nights & Blockbusters Movies");
  });
  // Add Paragraph
  addPBtn.addEventListener("click", () => {
    addEditableElement("p", "Glittering confetti danced across the neon sky as a mysterious carnival barker shouted about the wonders of bubblegum-scented fireworks. Meanwhile, an old VHS tape lurked in the dusty corner of a retro arcade.");
  });
  // Add Button
  addButtonBtn.addEventListener("click", () => {
    addEditableElement("button", "Click me");
  });
  // Add Image
  addImgBtn.addEventListener("click", () => {
    if (!requireCell()) return;
    const defaultImageUrl = "https://placehold.co/800x800.jpg";
    addEditableElement("img", defaultImageUrl);
  });
  
  // Add List
  addListBtn.addEventListener("click", () => {
    if (!requireCell()) return;
    
    // Ensure we're using the correct selected cell
    const targetCell = window.selectedCell;
    if (!targetCell) {
      alert("No cell selected. Please select a cell first.");
      return;
    }
    
    const ul = document.createElement("ul");
    const elementId = window.historyManager.generateUniqueId();
    ul.setAttribute('data-id', elementId);
    ul.classList.add("editable-element");
    
    // Add three list items
    for (let i = 1; i <= 3; i++) {
      const li = document.createElement("li");
      li.textContent = `List item ${i}`;
      ul.appendChild(li);
    }
    
    // Add event listeners
    addElementEventListeners(ul);
    
    // Remove the temporary padding from the cell when adding an element
    if (targetCell.style.padding === '10px') {
      targetCell.style.padding = '';
    }
    
    targetCell.appendChild(ul);
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.ADD_ELEMENT, {
      elementId: elementId,
      cellId: targetCell.getAttribute('data-id'),
      tagName: "ul",
      content: ul.innerHTML
    });
  });
  
  // Add Task List
  addTaskListBtn.addEventListener("click", () => {
    if (!requireCell()) return;
    
    // Ensure we're using the correct selected cell
    const targetCell = window.selectedCell;
    if (!targetCell) {
      alert("No cell selected. Please select a cell first.");
      return;
    }
    
    const ul = document.createElement("ul");
    const elementId = window.historyManager.generateUniqueId();
    ul.setAttribute('data-id', elementId);
    ul.classList.add("editable-element");
    
    // Add three task list items
    for (let i = 1; i <= 3; i++) {
      const li = document.createElement("li");
      li.className = "task-list-item";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.disabled = true;
      if (i === 2) checkbox.checked = true; // Make the second item checked
      
      li.appendChild(checkbox);
      li.appendChild(document.createTextNode(`Task ${i}`));
      ul.appendChild(li);
    }
    
    // Add event listeners
    addElementEventListeners(ul);
    
    // Remove the temporary padding from the cell when adding an element
    if (targetCell.style.padding === '10px') {
      targetCell.style.padding = '';
    }
    
    targetCell.appendChild(ul);
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.ADD_ELEMENT, {
      elementId: elementId,
      cellId: targetCell.getAttribute('data-id'),
      tagName: "ul",
      content: ul.innerHTML
    });
  });
  
  // Add Divider (HR)
  addDividerBtn.addEventListener("click", () => {
    if (!requireCell()) return;
    
    // Ensure we're using the correct selected cell
    const targetCell = window.selectedCell;
    if (!targetCell) {
      alert("No cell selected. Please select a cell first.");
      return;
    }
    
    const hr = document.createElement("hr");
    const elementId = window.historyManager.generateUniqueId();
    hr.setAttribute('data-id', elementId);
    hr.classList.add("editable-element");
    
    // Add event listeners
    addElementEventListeners(hr);
    
    // Remove the temporary padding from the cell when adding an element
    if (targetCell.style.padding === '10px') {
      targetCell.style.padding = '';
    }
    
    targetCell.appendChild(hr);
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.ADD_ELEMENT, {
      elementId: elementId,
      cellId: targetCell.getAttribute('data-id'),
      tagName: "hr",
      content: ""
    });
  });
  
  // Add Monospace Text
  addCodeBtn.addEventListener("click", () => {
    if (!requireCell()) return;
    
    // Ensure we're using the correct selected cell
    const targetCell = window.selectedCell;
    if (!targetCell) {
      alert("No cell selected. Please select a cell first.");
      return;
    }
    
    const pre = document.createElement("pre");
    const elementId = window.historyManager.generateUniqueId();
    pre.setAttribute('data-id', elementId);
    const code = document.createElement("code");
    code.textContent = "// Your code here\nfunction example() {\n  return 'Hello, world!';\n}";
    pre.appendChild(code);
    pre.classList.add("editable-element");
    
    // Add event listeners
    addElementEventListeners(pre);
    
    // Remove the temporary padding from the cell when adding an element
    if (targetCell.style.padding === '10px') {
      targetCell.style.padding = '';
    }
    
    targetCell.appendChild(pre);
    
    // Add to history
    window.historyManager.addToHistory(window.historyManager.ACTION_TYPES.ADD_ELEMENT, {
      elementId: elementId,
      cellId: targetCell.getAttribute('data-id'),
      tagName: "pre",
      content: pre.innerHTML
    });
  });
  
  // Clear element selection when clicking elsewhere
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".editable-element") && 
        !e.target.closest("#styleModal") && 
        !e.target.closest("#open-style-modal")) {
      document.querySelectorAll(".editable-element").forEach(elem => {
        elem.classList.remove("selected-element");
      });
      window.selectedElement = null;
      deleteElementBtn.disabled = true;
      openStyleModalBtn.disabled = true;
    }
  });
  
  // Make functions available globally
  window.addElementEventListeners = addElementEventListeners;
});