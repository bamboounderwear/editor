// domUtils.js - Utility functions for DOM manipulation

/**
 * Add event listeners to an editable element
 * @param {HTMLElement} el - The element to add listeners to
 */
function addElementEventListeners(el) {
  // On click, select this element for styling
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".editable-element").forEach(elem => {
      elem.classList.remove("selected-element");
    });
    window.selectedElement = el;
    el.classList.add("selected-element");
    document.getElementById('delete-element').disabled = false;
    document.getElementById('open-style-modal').disabled = false;
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

/**
 * Clear all selected elements
 */
function clearElementSelection() {
  document.querySelectorAll(".editable-element").forEach(elem => {
    elem.classList.remove("selected-element");
  });
  window.selectedElement = null;
  document.getElementById('delete-element').disabled = true;
  document.getElementById('open-style-modal').disabled = true;
}

/**
 * Find all elements with a specific class
 * @param {string} className - The class to search for
 * @returns {NodeList} - List of elements with the class
 */
function getElementsByClass(className) {
  return document.querySelectorAll('.' + className);
}

/**
 * Remove a specific class from all elements that have it
 * @param {string} className - The class to remove
 */
function removeClassFromAll(className) {
  getElementsByClass(className).forEach(el => {
    el.classList.remove(className);
  });
}

/**
 * Create a new element with attributes and content
 * @param {string} tagName - The tag name for the element
 * @param {Object} attributes - Key-value pairs of attributes
 * @param {string|HTMLElement} content - Content to add to the element
 * @returns {HTMLElement} - The created element
 */
function createElement(tagName, attributes = {}, content = '') {
  const element = document.createElement(tagName);
  
  // Add attributes
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  // Add content
  if (typeof content === 'string') {
    element.textContent = content;
  } else if (content instanceof HTMLElement) {
    element.appendChild(content);
  }
  
  return element;
}

// Export functions for use in other modules
window.domUtils = {
  addElementEventListeners,
  clearElementSelection,
  getElementsByClass,
  removeClassFromAll,
  createElement
};