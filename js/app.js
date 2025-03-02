// app.js - Main application initialization and dropdown functionality

document.addEventListener('DOMContentLoaded', function() {
  // Initialize dropdown functionality
  const dropdownBtn = document.getElementById('create-grid-btn');
  const dropdownContent = document.getElementById('create-grid-content');
  
  dropdownBtn.addEventListener('click', function() {
    dropdownContent.classList.toggle('show');
    dropdownBtn.classList.toggle('active');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown') && dropdownContent.classList.contains('show')) {
      dropdownContent.classList.remove('show');
      dropdownBtn.classList.remove('active');
    }
  });
  
  // Prevent dropdown from closing when clicking inside it
  dropdownContent.addEventListener('click', function(event) {
    event.stopPropagation();
  });

  // Initialize undo button
  const undoBtn = document.getElementById('undo-button');
  undoBtn.addEventListener('click', () => {
    window.historyManager.undo();
  });
});