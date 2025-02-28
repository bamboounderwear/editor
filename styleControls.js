document.addEventListener("DOMContentLoaded", () => {
  // Create the Style Controls panel in the sidebar.
  const sidebar = document.querySelector(".sidebar");
  const styleSection = document.createElement("section");
  styleSection.id = "style-controls";
  styleSection.innerHTML = `
    <h3>Style Controls</h3>
    <div>
      <label for="typography-select">Typography Preset:</label>
      <select id="typography-select">
        <option value="">Default</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="p">Paragraph</option>
        <option value="small">Small</option>
        <option value="xsmall">X-Small</option>
      </select>
    </div>
    <div>
      <label for="margin-select">Margin:</label>
      <select id="margin-select">
        <option value="">Default</option>
        <option value="margin0">0</option>
        <option value="margin1">1</option>
        <option value="margin2">2</option>
        <option value="margin3">3</option>
        <option value="margin4">4</option>
        <option value="margin5">5</option>
      </select>
    </div>
    <div>
      <label for="padding-select">Padding:</label>
      <select id="padding-select">
        <option value="">Default</option>
        <option value="padding0">0</option>
        <option value="padding1">1</option>
        <option value="padding2">2</option>
        <option value="padding3">3</option>
        <option value="padding4">4</option>
        <option value="padding5">5</option>
      </select>
    </div>
    <button id="apply-style">Apply Style</button>
  `;
  sidebar.appendChild(styleSection);

  // This variable holds the currently selected element for style editing.
  let selectedElement = null;

  // When an element with the "editable-element" class is clicked,
  // load its current typography and spacing settings.
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("editable-element")) {
      selectedElement = e.target;
      // Set typography select based on tag name.
      const tag = selectedElement.tagName.toLowerCase();
      const typographySelect = document.getElementById("typography-select");
      if (["h1", "h2", "h3", "p", "small", "xsmall"].includes(tag)) {
        typographySelect.value = tag;
      } else {
        typographySelect.value = "";
      }
      // For margin and padding, check for existing classes.
      const marginSelect = document.getElementById("margin-select");
      const paddingSelect = document.getElementById("padding-select");
      marginSelect.value = "";
      paddingSelect.value = "";
      selectedElement.classList.forEach(cls => {
        if (cls.startsWith("margin")) {
          marginSelect.value = cls;
        }
        if (cls.startsWith("padding")) {
          paddingSelect.value = cls;
        }
      });
    }
  });

  // When the Apply Style button is clicked, update the selected element.
  document.getElementById("apply-style").addEventListener("click", () => {
    if (!selectedElement) {
      alert("Please select an element first.");
      return;
    }
    const typography = document.getElementById("typography-select").value;
    // If a typography preset is chosen and it's different from the element's tag,
    // replace the element with a new element of that tag.
    if (typography && typography !== selectedElement.tagName.toLowerCase()) {
      const newEl = document.createElement(typography);
      newEl.innerHTML = selectedElement.innerHTML;
      newEl.style.cssText = selectedElement.style.cssText;
      newEl.className = selectedElement.className;
      newEl.classList.add("editable-element");
      selectedElement.parentNode.replaceChild(newEl, selectedElement);
      selectedElement = newEl;
    }
    // Remove any existing margin or padding classes.
    selectedElement.classList.forEach(cls => {
      if (cls.startsWith("margin") || cls.startsWith("padding")) {
        selectedElement.classList.remove(cls);
      }
    });
    // Apply new margin and padding classes.
    const marginClass = document.getElementById("margin-select").value;
    const paddingClass = document.getElementById("padding-select").value;
    if (marginClass) {
      selectedElement.classList.add(marginClass);
    }
    if (paddingClass) {
      selectedElement.classList.add(paddingClass);
    }
  });
});
