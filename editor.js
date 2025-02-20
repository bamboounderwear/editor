// Create a floating toolbar that follows selection
function createFloatingToolbar() {
  const toolbar = document.createElement('div');
  toolbar.className = 'floating-toolbar';
  toolbar.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    display: none;
    gap: 4px;
    z-index: 1000;
  `;
  document.body.appendChild(toolbar);
  return toolbar;
}

// Create color picker interface
function createColorPicker(element, property, currentColor) {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
  `;

  const label = document.createElement('span');
  label.textContent = property === 'color' ? 'Text:' : 'Background:';
  label.style.fontSize = '12px';

  const input = document.createElement('input');
  input.type = 'color';
  input.value = convertToHex(currentColor);
  input.style.cssText = `
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;

  input.addEventListener('input', (e) => {
    element.style[property] = e.target.value;
  });

  container.appendChild(label);
  container.appendChild(input);
  return container;
}

// Convert any color format to hex
function convertToHex(color) {
  const div = document.createElement('div');
  div.style.color = color;
  document.body.appendChild(div);
  const computed = getComputedStyle(div).color;
  document.body.removeChild(div);
  
  // Convert rgb to hex
  if (computed.startsWith('rgb')) {
    const [r, g, b] = computed.match(/\d+/g).map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  
  return color;
}

// Create export controls
function createExportControls() {
  const controls = document.createElement('div');
  controls.className = 'export-controls';
  controls.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    gap: 8px;
    z-index: 1000;
  `;

  const undoHistory = [];
  let isExporting = false;

  // Create buttons
  const buttons = [
    { label: '🏠 Home', action: 'home' },
    { label: '↩️ Undo', action: 'undo' },
    { label: '📄 HTML', action: 'html' },
    { label: '📑 PDF', action: 'pdf' },
    { label: '🖼️ JPG', action: 'jpg' }
  ];

  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.innerText = btn.label;
    button.style.cssText = `
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
    `;

    button.addEventListener('mouseover', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    });

    button.addEventListener('mouseout', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });

    button.addEventListener('click', async () => {
      switch (btn.action) {
        case 'home':
          window.location.href = '/';
          break;

        case 'undo':
          if (undoHistory.length > 0) {
            const lastState = undoHistory.pop();
            document.body.innerHTML = lastState;
            initializeEditor(); // Reinitialize editor after undo
          }
          break;

        case 'html':
          exportAsHtml();
          break;

        case 'pdf':
          await exportAsPdf();
          break;

        case 'jpg':
          await exportAsJpg();
          break;
      }
    });

    controls.appendChild(button);
  });

  document.body.appendChild(controls);
  return { controls, undoHistory };
}

// Create a container for the content
function createContentContainer() {
  // Check if container already exists
  let container = document.querySelector('.editor-content-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'editor-content-container';
    
    // Move all body content into the container
    const bodyContent = Array.from(document.body.children);
    bodyContent.forEach(child => {
      if (!child.classList.contains('floating-toolbar') && 
          !child.classList.contains('export-controls') &&
          !child.classList.contains('editor-content-container')) {
        container.appendChild(child);
      }
    });
    
    document.body.appendChild(container);
  }
  
  // Set container styles
  container.style.cssText = `
    min-height: 100vh;
    width: 100%;
    margin: 0 auto;
    position: relative;
    background: ${getComputedStyle(document.body).background};
  `;
  
  // Set body styles
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.minHeight = '100vh';
  
  return container;
}

// Check if element has color properties
function hasColorProperties(element) {
  const style = getComputedStyle(element);
  return style.color !== 'rgba(0, 0, 0, 0)' || 
         style.backgroundColor !== 'rgba(0, 0, 0, 0)';
}

// Create context-specific editing buttons
function createEditingButtons(element, toolbar) {
  toolbar.innerHTML = ''; // Clear existing buttons
  
  const buttons = [];
  const imageUploadInput = createImageUploadInput();
  
  // Add element-specific buttons
  if (element.tagName === 'IMG') {
    buttons.push(
      { command: 'uploadImage', icon: '📤' },
      { command: 'editImage', icon: '🖼️' },
      { command: 'clearImage', icon: '🗑️' }
    );
  } else if (element.tagName === 'BUTTON') {
    buttons.push({ command: 'editButton', icon: '🔲' });
  } else if (element.nodeType === 3 || element.isContentEditable) {
    buttons.push(
      { command: 'bold', icon: '𝐁' },
      { command: 'italic', icon: '𝑰' },
      { command: 'createLink', icon: '🔗' }
    );
  }

  // Add color pickers if element has color properties
  if (hasColorProperties(element)) {
    const style = getComputedStyle(element);
    
    if (style.color !== 'rgba(0, 0, 0, 0)') {
      toolbar.appendChild(createColorPicker(element, 'color', style.color));
    }
    
    if (style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      toolbar.appendChild(createColorPicker(element, 'backgroundColor', style.backgroundColor));
    }
  }

  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.innerHTML = btn.icon;
    button.style.cssText = `
      padding: 4px 8px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 3px;
      cursor: pointer;
      font-size: 14px;
      min-width: 30px;
    `;
    
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      
      switch (btn.command) {
        case 'uploadImage':
          imageUploadInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
              handleImageUpload(file, element);
            }
            imageUploadInput.value = ''; // Reset input
          };
          imageUploadInput.click();
          break;

        case 'editImage':
          const newSrc = prompt('Enter new image URL:', element.src);
          if (newSrc) {
            const img = new Image();
            img.onload = () => {
              element.src = newSrc;
              element.alt = prompt('Enter new alt text:', element.alt) || '';
              // Clear stored image if exists
              if (element.dataset.imageId) {
                localStorage.removeItem(`editor_image_${element.dataset.imageId}`);
                delete element.dataset.imageId;
              }
            };
            img.onerror = () => {
              alert('Invalid image URL. Please try again.');
            };
            img.src = newSrc;
          }
          break;

        case 'clearImage':
          if (element.dataset.imageId) {
            localStorage.removeItem(`editor_image_${element.dataset.imageId}`);
            delete element.dataset.imageId;
            alert('Image storage cleared. The image will remain visible until page reload.');
          }
          break;

        case 'editButton':
          const newText = prompt('Enter new button text:', element.innerText);
          if (newText) element.innerText = newText;
          break;

        case 'createLink':
          const url = prompt('Enter URL:');
          if (url) document.execCommand(btn.command, false, url);
          break;

        default:
          document.execCommand(btn.command);
      }
    });

    toolbar.appendChild(button);
  });
}

// Export functions
function exportAsHtml() {
  // Clone the document and remove editor elements
  const clone = document.documentElement.cloneNode(true);
  clone.querySelector('.floating-toolbar')?.remove();
  clone.querySelector('.export-controls')?.remove();

  // Remove editing-related attributes and styles
  clone.querySelectorAll('*').forEach(element => {
    element.removeAttribute('contenteditable');
    element.style.outline = '';
    element.style.cursor = '';
  });

  // Create and download the HTML file
  const blob = new Blob([clone.outerHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exported-page.html';
  a.click();
  URL.revokeObjectURL(url);
}

async function exportAsPdf() {
  // Load scripts dynamically
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

  // Hide editor elements
  const editorElements = document.querySelectorAll('.floating-toolbar, .export-controls');
  editorElements.forEach(el => el.style.display = 'none');

  // Remove outlines
  const elements = document.querySelectorAll('*');
  const originalOutlines = new Map();
  elements.forEach(el => {
    originalOutlines.set(el, el.style.outline);
    el.style.outline = 'none';
  });

  try {
    const container = document.querySelector('.editor-content-container');
    const canvas = await html2canvas(container || document.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: container?.offsetWidth || document.body.offsetWidth,
      windowHeight: container?.offsetHeight || document.body.offsetHeight
    });

    const pdf = new jspdf.jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2]
    });

    pdf.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      0,
      0,
      canvas.width / 2,
      canvas.height / 2
    );

    pdf.save('exported-page.pdf');
  } finally {
    // Restore editor elements and outlines
    editorElements.forEach(el => el.style.display = '');
    elements.forEach(el => {
      el.style.outline = originalOutlines.get(el);
    });
  }
}

async function exportAsJpg() {
  // Load html2canvas script dynamically
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');

  // Hide editor elements
  const editorElements = document.querySelectorAll('.floating-toolbar, .export-controls');
  editorElements.forEach(el => el.style.display = 'none');

  // Remove outlines
  const elements = document.querySelectorAll('*');
  const originalOutlines = new Map();
  elements.forEach(el => {
    originalOutlines.set(el, el.style.outline);
    el.style.outline = 'none';
  });

  try {
    const container = document.querySelector('.editor-content-container');
    const canvas = await html2canvas(container || document.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: container?.offsetWidth || document.body.offsetWidth,
      windowHeight: container?.offsetHeight || document.body.offsetHeight
    });

    const url = canvas.toDataURL('image/jpeg', 0.9);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported-page.jpg';
    a.click();
  } finally {
    // Restore editor elements and outlines
    editorElements.forEach(el => el.style.display = '');
    elements.forEach(el => {
      el.style.outline = originalOutlines.get(el);
    });
  }
}

// Helper function to load external scripts
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Create an image upload input
function createImageUploadInput() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  document.body.appendChild(input);
  return input;
}

// Compress image before storing
function compressImage(dataUrl, maxWidth = 800) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress as JPEG with 0.8 quality
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Clean up old images if storage is full
function cleanupOldImages() {
  const keys = Object.keys(localStorage).filter(key => key.startsWith('editor_image_'));
  if (keys.length > 0) {
    // Remove oldest image
    const oldestKey = keys.sort()[0];
    localStorage.removeItem(oldestKey);
    return true;
  }
  return false;
}

// Store image in localStorage with retry on quota exceeded
async function storeImage(imageId, dataUrl) {
  try {
    const compressedDataUrl = await compressImage(dataUrl);
    localStorage.setItem(`editor_image_${imageId}`, compressedDataUrl);
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      // Try to clean up and retry once
      if (cleanupOldImages()) {
        try {
          const compressedDataUrl = await compressImage(dataUrl);
          localStorage.setItem(`editor_image_${imageId}`, compressedDataUrl);
          return true;
        } catch (retryError) {
          console.error('Error storing image after cleanup:', retryError);
          return false;
        }
      }
    }
    console.error('Error storing image:', e);
    return false;
  }
}

// Load image from localStorage
function loadImage(imageId) {
  return localStorage.getItem(`editor_image_${imageId}`);
}

// Handle image upload
async function handleImageUpload(file, element) {
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    const imageId = `img_${Date.now()}`;
    if (await storeImage(imageId, e.target.result)) {
      const compressedDataUrl = await compressImage(e.target.result);
      element.src = compressedDataUrl;
      element.dataset.imageId = imageId;
      element.alt = file.name.split('.')[0] || '';
    } else {
      alert('Failed to store image. Please try a smaller image or clear some stored images.');
    }
  };
  
  reader.onerror = () => {
    alert('Error reading image file. Please try again.');
  };
  
  reader.readAsDataURL(file);
}

// Position the toolbar near the selected element
function positionToolbar(element, toolbar) {
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  toolbar.style.top = `${rect.top + scrollTop - toolbar.offsetHeight - 5}px`;
  toolbar.style.left = `${rect.left + scrollLeft}px`;
  toolbar.style.display = 'flex';
}

// Initialize the editor
function initializeEditor() {
  const toolbar = createFloatingToolbar();
  const { controls, undoHistory } = createExportControls();
  const container = createContentContainer();
  let activeElement = null;
  let selectionTimeout = null;

  // Save initial state
  undoHistory.push(document.body.innerHTML);

  // Restore stored images
  document.querySelectorAll('img').forEach(img => {
    if (img.dataset.imageId) {
      const storedImage = loadImage(img.dataset.imageId);
      if (storedImage) {
        img.src = storedImage;
      }
    }
  });

  // Handle element selection
  document.addEventListener('click', (e) => {
    const target = e.target;
    
    // Ignore clicks on the toolbar itself
    if (target.closest('.floating-toolbar') || target.closest('.export-controls')) return;
    
    // Hide toolbar when clicking outside of editable elements
    if (!target.isContentEditable && 
        target.tagName !== 'IMG' && 
        target.tagName !== 'BUTTON') {
      toolbar.style.display = 'none';
      return;
    }

    activeElement = target;
    createEditingButtons(activeElement, toolbar);
    positionToolbar(activeElement, toolbar);
  });

  // Handle text selection
  document.addEventListener('selectionchange', () => {
    clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      if (range.collapsed) return;
      
      const selectedElement = selection.anchorNode.parentElement;
      if (selectedElement.isContentEditable) {
        activeElement = selectedElement;
        createEditingButtons(activeElement, toolbar);
        positionToolbar(range, toolbar);
      }
    }, 200);
  });

  // Make content editable and track changes
  container.querySelectorAll('*').forEach(element => {
    if (element.tagName !== 'SCRIPT' && 
        element.tagName !== 'STYLE' && 
        !element.closest('.floating-toolbar') &&
        !element.closest('.export-controls')) {
      
      if (element.tagName === 'IMG' || element.tagName === 'BUTTON') {
        element.style.cursor = 'pointer';
      } else if (!element.closest('nav') && !element.closest('header')) {
        element.contentEditable = 'true';
        
        // Track changes for undo
        element.addEventListener('input', () => {
          undoHistory.push(document.body.innerHTML);
          // Keep history size manageable
          if (undoHistory.length > 50) {
            undoHistory.shift();
          }
        });
      }

      // Visual feedback on hover
      element.addEventListener('mouseenter', () => {
        if (element.isContentEditable || 
            element.tagName === 'IMG' || 
            element.tagName === 'BUTTON') {
          element.style.outline = '1px dashed #ccc';
        }
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.outline = 'none';
      });
    }
  });
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEditor);