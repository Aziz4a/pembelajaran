// Enhanced Book Features
class EnhancedBook {
  constructor() {
    this.darkMode = false;
    this.soundEnabled = true;
    this.currentZoom = 100;
    this.pageFlipSound = new Audio('../../assets/audio/page-flip.mp3');
    this.initializeFeatures();
  }

  initializeFeatures() {
    this.setupThemeToggle();
    this.setupHighlighter();
    this.setupNotes();
    this.setupZoom();
    this.setupReadingGuide();
    this.setupAudioControl();
    this.setupFocusMode();
  }

  setupThemeToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.innerHTML = '🌙';
    toggle.onclick = () => this.toggleDarkMode();
    document.body.appendChild(toggle);
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode');
    document.querySelector('.theme-toggle').innerHTML = this.darkMode ? '☀️' : '🌙';
  }

  setupHighlighter() {
    const highlighter = document.createElement('div');
    highlighter.className = 'highlighter';
    highlighter.innerHTML = `
      <div class="highlight-color highlight-yellow" data-color="yellow"></div>
      <div class="highlight-color highlight-green" data-color="green"></div>
      <div class="highlight-color highlight-blue" data-color="blue"></div>
    `;
    document.body.appendChild(highlighter);

    let isHighlighting = false;
    let currentColor = 'yellow';

    // Set up highlight color selection
    highlighter.querySelectorAll('.highlight-color').forEach(color => {
      color.onclick = () => {
        currentColor = color.dataset.color;
        document.body.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="background: ${currentColor}"></svg>') 0 0, auto`;
        isHighlighting = !isHighlighting;
      }
    });

    // Handle text highlighting
    document.addEventListener('mouseup', () => {
      if (!isHighlighting) return;
      
      const selection = window.getSelection();
      if (!selection.toString()) return;

      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = `highlight-${currentColor}`;
      range.surroundContents(span);
      selection.removeAllRanges();
    });
  }

  setupNotes() {
    // Add note button to selected text
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      if (!selection.toString()) return;

      const range = selection.getRangeAt(0);
      const noteIcon = document.createElement('span');
      noteIcon.className = 'note-icon';
      noteIcon.innerHTML = '📝';
      noteIcon.onclick = (e) => this.showNotePopup(e);
      
      const span = document.createElement('span');
      span.appendChild(noteIcon);
      range.insertNode(span);
    });
  }

  showNotePopup(event) {
    const popup = document.createElement('div');
    popup.className = 'note-popup active';
    popup.innerHTML = `
      <textarea class="note-textarea" placeholder="Tulis catatanmu di sini..."></textarea>
      <div class="note-actions">
        <button onclick="this.closest('.note-popup').remove()">Simpan</button>
        <button onclick="this.closest('.note-popup').remove()">Tutup</button>
      </div>
    `;
    
    popup.style.left = `${event.pageX}px`;
    popup.style.top = `${event.pageY}px`;
    document.body.appendChild(popup);
  }

  setupZoom() {
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.innerHTML = `
      <button class="zoom-button" onclick="book.zoom('in')">+</button>
      <button class="zoom-button" onclick="book.zoom('out')">-</button>
    `;
    document.body.appendChild(zoomControls);
  }

  zoom(direction) {
    const change = direction === 'in' ? 10 : -10;
    this.currentZoom = Math.max(50, Math.min(150, this.currentZoom + change));
    document.querySelector('.book').style.transform = `scale(${this.currentZoom / 100})`;
  }

  setupReadingGuide() {
    const guide = document.createElement('div');
    guide.className = 'reading-guide';
    document.body.appendChild(guide);

    document.addEventListener('mousemove', (e) => {
      if (document.body.classList.contains('guide-active')) {
        guide.style.top = `${e.pageY}px`;
      }
    });

    // Toggle guide with 'G' key
    document.addEventListener('keypress', (e) => {
      if (e.key.toLowerCase() === 'g') {
        document.body.classList.toggle('guide-active');
      }
    });
  }

  setupAudioControl() {
    const audioControl = document.createElement('div');
    audioControl.className = 'audio-control';
    audioControl.innerHTML = `
      <button class="audio-toggle" onclick="book.toggleSound()">🔊</button>
      <span>Efek Suara</span>
    `;
    document.body.appendChild(audioControl);
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    document.querySelector('.audio-toggle').innerHTML = this.soundEnabled ? '🔊' : '🔇';
  }

  playPageFlip() {
    if (this.soundEnabled) {
      this.pageFlipSound.currentTime = 0;
      this.pageFlipSound.play();
    }
  }

  setupFocusMode() {
    const focusToggle = document.createElement('button');
    focusToggle.className = 'focus-toggle';
    focusToggle.innerHTML = '👀';
    focusToggle.onclick = () => document.body.classList.toggle('focus-mode');
    document.body.appendChild(focusToggle);
  }
}

// Initialize enhanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.book = new EnhancedBook();
});