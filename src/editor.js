export class TemplateEditor {
  constructor() {
    this.currentElement = null;
    this.toolbar = this.createToolbar();
    this.exportToolbar = this.createExportToolbar();
    this.homeButton = this.createHomeButton();
    this.undoStack = [];
    this.setupEventListeners();
  }

  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'editor-toolbar';
    toolbar.innerHTML = `
      <button id="text-bold" title="Bold"><strong>B</strong></button>
      <button id="text-italic" title="Italic"><em>I</em></button>
      <div class="alignment-group">
        <button id="align-left" title="Align Left">⫷</button>
        <button id="align-center" title="Align Center">⋮</button>
        <button id="align-right" title="Align Right">⫸</button>
      </div>
      <input type="color" class="color-picker" title="Text Color">
      <input type="color" class="color-picker" title="Background Color">
      <button id="increase-font" title="Increase Font Size">A+</button>
      <button id="decrease-font" title="Decrease Font Size">A-</button>
      <button id="replace-image" title="Replace Image">🖼️</button>
    `;
    document.body.appendChild(toolbar);
    return toolbar;
  }

  createExportToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'export-toolbar';
    toolbar.innerHTML = `
      <button id="undo" title="Undo" class="icon-button">↩️</button>
      <button id="export-html" title="Export HTML">HTML</button>
      <button id="export-image" title="Export Image">JPG</button>
      <button id="export-pdf" title="Export PDF">PDF</button>
    `;
    document.body.appendChild(toolbar);
    return toolbar;
  }

  createHomeButton() {
    const button = document.createElement('a');
    button.href = '/';
    button.className = 'home-button';
    button.innerHTML = '🏠 Home';
    document.body.appendChild(button);
    return button;
  }

  createImageUploadDialog() {
    const overlay = document.createElement('div');
    overlay.className = 'image-upload-overlay';
    overlay.innerHTML = `
      <div class="image-upload-dialog">
        <h3>Replace Image</h3>
        <input type="file" accept="image/*">
        <div class="buttons">
          <button class="cancel">Cancel</button>
          <button class="primary">Upload</button>
        </div>
      </div>
    `;
    return overlay;
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      const isEditable = e.target.hasAttribute('data-editable');
      const isImage = e.target.tagName === 'IMG';
      
      if (isEditable || isImage) {
        this.currentElement = e.target;
        if (!isImage && isEditable) {
          this.currentElement.contentEditable = true;
        }
        this.showToolbar();
      } else if (!e.target.closest('.editor-toolbar') && !e.target.closest('.image-upload-dialog')) {
        this.hideToolbar();
        if (this.currentElement && this.currentElement.tagName !== 'IMG') {
          this.currentElement.contentEditable = false;
        }
        this.currentElement = null;
      }
    });

    // Save state before any content changes
    document.addEventListener('input', (e) => {
      if (e.target.hasAttribute('data-editable') || e.target.tagName === 'IMG') {
        this.saveState();
      }
    });

    // Toolbar button handlers
    this.toolbar.querySelector('#text-bold').onclick = () => {
      this.saveState();
      this.toggleStyle('bold');
    };
    this.toolbar.querySelector('#text-italic').onclick = () => {
      this.saveState();
      this.toggleStyle('italic');
    };

    // Alignment handlers
    this.toolbar.querySelector('#align-left').onclick = () => {
      this.saveState();
      if (this.currentElement) this.currentElement.style.textAlign = 'left';
    };
    this.toolbar.querySelector('#align-center').onclick = () => {
      this.saveState();
      if (this.currentElement) this.currentElement.style.textAlign = 'center';
    };
    this.toolbar.querySelector('#align-right').onclick = () => {
      this.saveState();
      if (this.currentElement) this.currentElement.style.textAlign = 'right';
    };

    this.toolbar.querySelector('input[title="Text Color"]').onchange = (e) => {
      this.saveState();
      this.currentElement.style.color = e.target.value;
    };
    this.toolbar.querySelector('input[title="Background Color"]').onchange = (e) => {
      this.saveState();
      this.currentElement.style.backgroundColor = e.target.value;
    };
    this.toolbar.querySelector('#increase-font').onclick = () => {
      this.saveState();
      this.adjustFontSize(1);
    };
    this.toolbar.querySelector('#decrease-font').onclick = () => {
      this.saveState();
      this.adjustFontSize(-1);
    };
    this.toolbar.querySelector('#replace-image').onclick = () => this.replaceImage();

    // Export handlers
    this.exportToolbar.querySelector('#undo').onclick = () => this.undo();
    this.exportToolbar.querySelector('#export-html').onclick = () => this.exportHTML();
    this.exportToolbar.querySelector('#export-image').onclick = () => this.exportImage();
    this.exportToolbar.querySelector('#export-pdf').onclick = () => this.exportPDF();
  }

  saveState() {
    if (!this.currentElement) return;
    
    const state = {
      element: this.currentElement,
      content: this.currentElement.tagName === 'IMG' 
        ? this.currentElement.src 
        : this.currentElement.innerHTML,
      style: this.currentElement.style.cssText
    };
    
    this.undoStack.push(state);
    
    // Keep last 50 states
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
  }

  undo() {
    const lastState = this.undoStack.pop();
    if (lastState) {
      if (lastState.element.tagName === 'IMG') {
        lastState.element.src = lastState.content;
      } else {
        lastState.element.innerHTML = lastState.content;
      }
      lastState.element.style.cssText = lastState.style;
    }
  }

  toggleStyle(style) {
    if (!this.currentElement) return;
    document.execCommand(style, false, null);
  }

  adjustFontSize(delta) {
    if (!this.currentElement) return;
    const currentSize = window.getComputedStyle(this.currentElement).fontSize;
    const newSize = parseInt(currentSize) + delta;
    this.currentElement.style.fontSize = `${newSize}px`;
  }

  replaceImage() {
    if (!this.currentElement || this.currentElement.tagName !== 'IMG') return;
    
    const dialog = this.createImageUploadDialog();
    document.body.appendChild(dialog);
    
    const fileInput = dialog.querySelector('input[type="file"]');
    const uploadButton = dialog.querySelector('button.primary');
    const cancelButton = dialog.querySelector('button.cancel');
    
    uploadButton.onclick = () => {
      const file = fileInput.files[0];
      if (file) {
        this.saveState();
        const reader = new FileReader();
        reader.onload = (e) => {
          if (this.currentElement && this.currentElement.tagName === 'IMG') {
            this.currentElement.src = e.target.result;
          }
          dialog.remove();
        };
        reader.readAsDataURL(file);
      }
    };
    
    cancelButton.onclick = () => dialog.remove();
  }

  async exportHTML() {
    const content = document.documentElement.outerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  async exportImage() {
    const content = document.querySelector('.template-container, .email-container, .post-container, .slide-container');
    if (!content) return;

    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const url = canvas.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.jpg';
    a.click();
  }

  async exportPDF() {
    const content = document.querySelector('.template-container, .email-container, .post-container, .slide-container');
    if (!content) return;

    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    pdf.save('template.pdf');
  }

  showToolbar() {
    this.toolbar.style.display = 'flex';
    const isImage = this.currentElement?.tagName === 'IMG';
    this.toolbar.querySelector('#replace-image').style.display = isImage ? 'block' : 'none';
    
    // Hide text-related controls for images
    const textControls = ['#text-bold', '#text-italic', '#increase-font', '#decrease-font', '.alignment-group'];
    textControls.forEach(control => {
      const element = this.toolbar.querySelector(control);
      if (element) {
        element.style.display = isImage ? 'none' : control === '.alignment-group' ? 'flex' : 'block';
      }
    });
  }

  hideToolbar() {
    this.toolbar.style.display = 'none';
  }
}