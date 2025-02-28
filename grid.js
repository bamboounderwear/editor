// grid.js

// Variables to hold the currently selected grid and cell.
let selectedGrid = null;
let selectedCell = null;

// Get references to controls.
const addGridBtn = document.getElementById('add-grid');
const gridColumnsInput = document.getElementById('grid-columns');
const gridMobileInput = document.getElementById('grid-columns-mobile');
const preview = document.getElementById('preview');
const addCellBtn = document.getElementById('add-cell');
const cellControls = document.getElementById('cell-controls');
const cellSpanInput = document.getElementById('cell-span');
const updateCellBtn = document.getElementById('update-cell');
const exportBtn = document.getElementById('export');
const exportTextarea = document.getElementById('export-code');

// Clears the currently selected grid.
function clearGridSelection() {
  document.querySelectorAll('r-grid').forEach(grid => grid.classList.remove('selected'));
  selectedGrid = null;
  addCellBtn.disabled = true;
}

// Clears the currently selected cell.
function clearCellSelection() {
  document.querySelectorAll('r-cell.cell').forEach(cell => cell.classList.remove('selected'));
  selectedCell = null;
  cellControls.style.display = 'none';
  window.selectedCell = null;
}

// Create a new grid when "Add Grid" is clicked.
addGridBtn.addEventListener('click', (e) => {
  const cols = gridColumnsInput.value;
  const mobileCols = gridMobileInput.value;
  // Create a new grid element.
  const grid = document.createElement('r-grid');
  grid.setAttribute('columns', cols);
  grid.setAttribute('columns-s', mobileCols);
  grid.classList.add('grid-container');
  // Set a placeholder that is later removed on export.
  grid.innerHTML = '<p style="text-align:center; color:#777;">Click grid to select<br>then add cells</p>';
  
  // When clicking on the grid (except on its cells), select it.
  grid.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'r-cell') return;
    clearGridSelection();
    clearCellSelection();
    selectedGrid = grid;
    grid.classList.add('selected');
    addCellBtn.disabled = false;
    e.stopPropagation();
  });
  
  preview.appendChild(grid);
  clearGridSelection();
  clearCellSelection();
});

// Add a new cell to the currently selected grid.
addCellBtn.addEventListener('click', (e) => {
  if (!selectedGrid) return;
  const cell = document.createElement('r-cell');
  // Set default desktop span: "1-2" means cell starts at column 1 and spans one column.
  cell.setAttribute('span', '1-2');
  // Set default mobile span so the cell spans one column on small screens.
  cell.setAttribute('span-s', '1');
  cell.classList.add('cell');
  // Set default placeholder text.
  cell.textContent = 'Cell';
  
  // When a cell is clicked, select it for editing.
  cell.addEventListener('click', (e) => {
    e.stopPropagation();
    // If the cell contains only the default placeholder text, clear it.
    if (cell.textContent.trim() === 'Cell') {
      cell.textContent = '';
    }
    clearCellSelection();
    selectedCell = cell;
    window.selectedCell = cell; // Expose globally for elements.js.
    cell.classList.add('selected');
    // Populate the update input with the current desktop span value.
    cellSpanInput.value = cell.getAttribute('span');
    cellControls.style.display = 'block';
  });
  
  selectedGrid.appendChild(cell);
});

// Update the selected cell's desktop span attribute.
updateCellBtn.addEventListener('click', (e) => {
  if (!selectedCell) return;
  const newRange = cellSpanInput.value;
  selectedCell.setAttribute('span', newRange);
  selectedCell.classList.remove('selected');
  clearCellSelection();
  e.stopPropagation();
});

// Export functionality: clone the preview, remove placeholder text and header, and generate clean HTML.
exportBtn.addEventListener('click', (e) => {
  const previewClone = preview.cloneNode(true);
  // Remove any placeholder paragraphs (with "Click grid to select") from each grid.
  previewClone.querySelectorAll('r-grid').forEach(grid => {
    grid.querySelectorAll('p').forEach(p => {
      if (p.textContent.includes("Click grid to select")) {
        p.remove();
      }
    });
  });
  // Remove the header (e.g. "Page Preview") from the clone.
  const header = previewClone.querySelector('h2');
  if (header) header.remove();
  
  const exportedHTML = `
<!DOCTYPE html>
<html lang=en>
<head>
  <meta charset=UTF-8>
  <meta name=viewport content="width=device-width, initial-scale=1.0">
  <link rel=stylesheet href=https://rsms.me/inter/inter.css>
  <link rel=stylesheet href=https://rsms.me/res/fonts/iaw.css>
  <link rel=stylesheet href=raster2.css>
</head>
<body>
  ${previewClone.innerHTML}
</body>
</html>
  `.trim();
  
  exportTextarea.style.display = 'block';
  exportTextarea.value = exportedHTML;
  e.stopPropagation();
});

// Prevent global clearing when clicking inside the sidebar.
document.querySelector('.sidebar').addEventListener('click', (e) => {
  e.stopPropagation();
});

// Global click: clear selections if clicking outside the sidebar.
document.body.addEventListener('click', (e) => {
  if (e.target.closest('.sidebar')) return;
  clearGridSelection();
  clearCellSelection();
});
