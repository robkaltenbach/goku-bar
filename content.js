// GBar Timer Extension - Content Script
// Compatible with Opera, Chrome, Edge, and Brave

class GBarTimer {
  constructor() {
    this.timers = new Map(); // Track multiple timers by button element
    this.soundEnabled = true;
    this.customMinutes = 1; // Default 1 minute
    this.customSeconds = 0; // Default 0 seconds
    this.customInputOpen = false;
    this.dropdownOpen = false;
    this.fontColor = '#ffffff'; // Default white font
    this.saveInterval = null; // For periodic timer saves
    this.currentVersion = '1.5.1'; // Current extension version
    this.latestVersion = null; // Latest version from GitHub
    this.lastUpdateCheck = null; // Last time we checked for updates
    
    // Game-specific timers with Mafia.org URLs
    this.presets = [
      { label: 'Whack', seconds: 57, url: 'https://mafia.org/crime-whack.php' },
      { label: 'Mug', seconds: 120, url: 'https://mafia.org/crime-mug.php' },
      { label: 'Flight', seconds: 900, url: 'https://mafia.org/city-travel.php' },
      { label: 'Train', seconds: 1800, url: 'https://mafia.org/city-travel.php' },
      { label: 'Scavenge', seconds: 1320, url: 'https://mafia.org/city-scavenge.php' },
      { label: 'Old Man', seconds: 1800, url: 'https://mafia.org/city-oldman.php' },
      { label: 'Bandage', seconds: 300, url: 'https://mafia.org/info-inventory.php' },
      { label: 'Bank Robbery', seconds: 5400, url: 'https://mafia.org/crime-bankjob.php' },
      { label: 'Custom', seconds: 60, url: null }
    ];
    
    this.init();
  }
  
  async init() {
    await this.loadSettings();
    this.createToolbar();
    this.attachEventListeners();
    // Initialize custom timer inputs after toolbar is created
    this.initializeCustomInputs();
    await this.restoreTimers();
    
    // Start the main timer loop that updates all timers
    this.startTimerLoop();
    
    // Check for updates (async, don't block initialization)
    this.checkForUpdates();
  }
  
  initializeCustomInputs() {
    const minutesInput = document.getElementById('gbar-custom-minutes');
    const secondsInput = document.getElementById('gbar-custom-seconds');
    if (minutesInput) minutesInput.value = this.customMinutes;
    if (secondsInput) secondsInput.value = this.customSeconds;
    this.updateCustomTimerSeconds();
  }

  // New: Main timer loop that runs every second
  startTimerLoop() {
    setInterval(() => {
      this.updateAllTimers();
    }, 1000);
  }

  // New: Update all active timers
  updateAllTimers() {
    this.timers.forEach((timerData, buttonElement) => {
      if (timerData.status === 'running') {
        this.updateButtonDisplay(buttonElement, timerData);
        
        // Check if timer should complete
        const now = Date.now();
        const endTime = timerData.startTime + (timerData.duration * 1000);
        
        if (now >= endTime) {
          this.onTimerComplete(buttonElement, timerData);
        }
      }
    });
  }
  
  createToolbar() {
    // Check if toolbar already exists
    if (document.getElementById('gbar-toolbar')) {
      return;
    }
    
    const toolbar = document.createElement('div');
    toolbar.id = 'gbar-toolbar';
    toolbar.innerHTML = `
      <div class="gbar-logo">
        GBar
      </div>
      
      <div class="gbar-controls">
        <div class="gbar-preset-buttons" id="gbar-presets">
          ${(this.presets || []).map((preset) => 
            `<button class="gbar-btn preset" data-seconds="${preset.seconds}" data-url="${preset.url || ''}" data-label="${preset.label}">${preset.label}</button>`
          ).join('')}
          <div class="gbar-custom-input-container" id="gbar-custom-input-container">
            <input type="number" class="gbar-custom-input gbar-custom-minutes" id="gbar-custom-minutes" placeholder="min" min="0" max="999" value="1">
            <span class="gbar-custom-separator">:</span>
            <input type="number" class="gbar-custom-input gbar-custom-seconds" id="gbar-custom-seconds" placeholder="sec" min="0" max="59" value="0">
          </div>
        </div>
        
        <div class="gbar-sound-icon" id="gbar-sound" title="Toggle sound">
        </div>
        
        <button class="gbar-settings-icon" id="gbar-settings-btn" title="Settings">
        </button>
        
        <button class="gbar-btn gbar-toggle" id="gbar-toggle">×</button>
      </div>
    `;
    
    document.body.appendChild(toolbar);
    document.body.classList.add('gbar-active');
    // documentElement class already added at script start for instant space reservation
    
    // Create modal separately, outside the toolbar
    const modal = document.createElement('div');
    modal.id = 'gbar-modal';
    modal.className = 'gbar-modal';
    modal.innerHTML = `
      <div class="gbar-modal-content">
        <div class="gbar-modal-header">
          <h2>GBar Settings</h2>
          <button class="gbar-modal-close" id="gbar-modal-close">×</button>
        </div>
        <div class="gbar-modal-layout">
            <div class="gbar-modal-nav">
              <button class="gbar-nav-item active" data-section="about">About</button>
              <button class="gbar-nav-item" data-section="color">Color</button>
            </div>
          <div class="gbar-modal-body">
            <div class="gbar-section active" id="gbar-section-about">
              <h3>About GBar</h3>
              <div class="gbar-about-content">
                <div class="gbar-author">
                  <span class="gbar-made-by">Made by</span>
                  <span class="gbar-author-name">robkaltenbach</span>
                  <span class="gbar-slash">/</span>
                  <span class="gbar-author-name">Transistor</span>
                </div>
                <div class="gbar-version">Version 1.5.1 • 10/27/25</div>
                <div class="gbar-update-notification" id="gbar-update-notification" style="display: none;">
                  <div class="gbar-update-content">
                    <strong>Update Available!</strong>
                    <span>Version <span id="gbar-latest-version"></span> is now available.</span>
                    <a href="https://github.com/robkaltenbach/goku-bar/releases/latest" target="_blank" class="gbar-update-link">Download Update</a>
                  </div>
                </div>
                <p class="gbar-description">A minimal timer toolbar for Mafia.org with customizable presets and persistent timers.</p>
                
                <div class="gbar-contact">
                  <h4>Contact</h4>
                  <div class="gbar-contact-item">
                    <a href="https://x.com/robkaltenbach" target="_blank" class="gbar-contact-link">
                      <svg class="gbar-x-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      x.com/robkaltenbach
                    </a>
                  </div>
                  <div class="gbar-contact-item">
                    <a href="mailto:roberthkaltenbach@gmail.com" class="gbar-contact-link">
                      <svg class="gbar-email-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m2 7 10 7 10-7"/>
                      </svg>
                      roberthkaltenbach@gmail.com
                    </a>
                    <button class="gbar-copy-btn" id="gbar-copy-email" data-email="roberthkaltenbach@gmail.com" title="Copy email">
                      <svg class="gbar-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div class="gbar-donate">
                  <p class="gbar-donate-text">If you wanna thank me, buy me a coffee ☕</p>
                  <a href="https://www.paypal.com/donate/?hosted_button_id=PB2XVMXTUZKRU" target="_blank" class="gbar-donate-btn">
                    <svg class="gbar-paypal-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.32 21.97a.546.546 0 0 1-.26-.32c-.03-.15-.06-.3-.08-.45l-.84-5.24c-.04-.22 0-.32.22-.37l3.47-.81c2.25-.51 4.5-.75 6.79-.42 1.05.15 2.04.48 2.91 1.11.78.57 1.29 1.29 1.47 2.22.21 1.08-.06 2.07-.75 2.88-.87 1.02-2.01 1.56-3.27 1.83-1.71.36-3.45.42-5.19.3-1.35-.09-2.7-.27-4.05-.54-.21-.03-.42-.09-.42-.19zm11.29-6.3c.18-.93-.09-1.74-.75-2.43-.75-.78-1.71-1.17-2.76-1.35-1.92-.33-3.87-.27-5.8.09l-2.88.54c-.12.03-.18.09-.18.21l.57 3.54c.03.18 0 .21-.18.24l-2.61.48c-.12.03-.18 0-.21-.12L2.36 5.37c-.03-.15 0-.24.18-.27l3.48-.63c2.01-.36 4.05-.51 6.09-.39 1.26.06 2.49.27 3.63.81 1.17.54 2.01 1.35 2.46 2.58.42 1.14.33 2.28-.18 3.36-.54 1.14-1.41 1.95-2.52 2.46-.15.06-.3.15-.48.18-.09.03-.15 0-.21-.09z"/>
                    </svg>
                    Donate via PayPal
                  </a>
                  <div class="gbar-mafia-donate">
                    <p class="gbar-donate-text" style="margin-top: 15px;">Or donate on MR:</p>
                    <div class="gbar-mafia-key">
                      <div class="gbar-key-label">Mafia Returns Anon Key:</div>
                      <div class="gbar-key-value">af503b0787128c481e11700b7db61773</div>
                      <button class="gbar-copy-btn gbar-copy-key" data-key="af503b0787128c481e11700b7db61773" title="Copy key">
                        <svg class="gbar-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="gbar-section" id="gbar-section-color">
              <h3>Color Settings</h3>
              <div class="gbar-setting">
                <label>Font Color:</label>
                <div class="gbar-color-picker">
                  <div class="gbar-gradient-box" id="gbar-gradient-box">
                    <div class="gbar-color-cursor" id="gbar-color-cursor"></div>
                  </div>
                  <div class="gbar-color-preview-container">
                    <div class="gbar-color-preview" id="gbar-color-preview"></div>
                    <span class="gbar-color-label">Selected Color</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    this.setupGradientPicker();
    this.applyFontColor();
  }
  
  setupGradientPicker() {
    const gradientBox = document.getElementById('gbar-gradient-box');
    const cursor = document.getElementById('gbar-color-cursor');
    let isDragging = false;
    
    const updateColorFromPosition = (x, y) => {
      const rect = gradientBox.getBoundingClientRect();
      const relX = Math.max(0, Math.min(x - rect.left, rect.width));
      const relY = Math.max(0, Math.min(y - rect.top, rect.height));
      
      // Calculate hue (0-360) from x position
      const hue = Math.round((relX / rect.width) * 360);
      
      // Calculate lightness (100% at top to 0% at bottom)
      const lightness = Math.round(100 - (relY / rect.height) * 100);
      
      // Create color
      const color = `hsl(${hue}, 100%, ${lightness}%)`;
      
      // Convert to hex for storage
      const hexColor = this.hslToHex(hue, 100, lightness);
      
      // Update cursor position
      cursor.style.left = `${relX}px`;
      cursor.style.top = `${relY}px`;
      
      // Update color
      this.selectColor(hexColor);
    };
    
    gradientBox.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateColorFromPosition(e.clientX, e.clientY);
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        updateColorFromPosition(e.clientX, e.clientY);
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    // Set initial cursor position based on current color
    this.updateCursorPosition();
  }
  
  hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }
  
  updateCursorPosition() {
    // Position cursor based on current fontColor
    const gradientBox = document.getElementById('gbar-gradient-box');
    const cursor = document.getElementById('gbar-color-cursor');
    
    if (!gradientBox || !cursor) return;
    
    const rect = gradientBox.getBoundingClientRect();
    // Default to white position (top-left area)
    cursor.style.left = '10px';
    cursor.style.top = '10px';
  }
  
  attachEventListeners() {
    // Preset buttons - left click navigates, right click starts timer
    document.getElementById('gbar-presets').addEventListener('click', (e) => {
      if (e.target.classList.contains('preset')) {
        if (e.button === 0) { // Left click
          const url = e.target.dataset.url;
          if (url) {
            window.location.href = url;
          } else if (e.target.dataset.label === 'Custom') {
            this.toggleCustomInput();
          }
        }
      }
    });
    
    // Right click on presets - start/restart timer
    document.getElementById('gbar-presets').addEventListener('contextmenu', (e) => {
      if (e.target.classList.contains('preset')) {
        e.preventDefault();
        // Check if button is disabled (during notification period)
        if (e.target.disabled) return;
        const seconds = parseInt(e.target.dataset.seconds);
        const label = e.target.dataset.label;
        this.startTimer(seconds, e.target, label);
      }
    });
    
    // Custom input change - minutes
    document.getElementById('gbar-custom-minutes').addEventListener('input', (e) => {
      const value = parseInt(e.target.value) || 0;
      if (value >= 0 && value <= 999) {
        this.customMinutes = value;
        this.updateCustomTimerSeconds();
        this.saveSettings();
      }
    });
    
    // Custom input change - seconds
    document.getElementById('gbar-custom-seconds').addEventListener('input', (e) => {
      const value = parseInt(e.target.value) || 0;
      if (value >= 0 && value <= 59) {
        this.customSeconds = value;
        this.updateCustomTimerSeconds();
        this.saveSettings();
      }
    });
    
    // Toggle visibility
    document.getElementById('gbar-toggle').addEventListener('click', () => {
      this.toggleVisibility();
    });
    
    // Sound toggle
    document.getElementById('gbar-sound').addEventListener('click', () => {
      this.toggleSound();
    });
    
    // Settings button
    document.getElementById('gbar-settings-btn').addEventListener('click', () => {
      this.openModal();
    });

    // Modal close
    document.getElementById('gbar-modal-close').addEventListener('click', () => {
      this.closeModal();
    });
    
    // Close modal when clicking outside
    document.getElementById('gbar-modal').addEventListener('click', (e) => {
      if (e.target.id === 'gbar-modal') {
        this.closeModal();
      }
    });
    
    // Modal navigation
    document.querySelectorAll('.gbar-nav-item').forEach((navItem) => {
      navItem.addEventListener('click', (e) => {
        const section = e.target.dataset.section;
        this.switchSection(section);
      });
    });
    
    // Copy email button
    const copyEmailBtn = document.getElementById('gbar-copy-email');
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', () => {
        const email = copyEmailBtn.dataset.email;
        this.copyToClipboard(email, copyEmailBtn);
      });
    }
    
    // Copy MafiaReturns key button
    const copyKeyBtn = document.querySelector('.gbar-copy-key');
    if (copyKeyBtn) {
      copyKeyBtn.addEventListener('click', () => {
        const key = copyKeyBtn.dataset.key;
        this.copyToClipboard(key, copyKeyBtn);
      });
    }
  }
  
  toggleCustomInput() {
    const container = document.getElementById('gbar-custom-input-container');
    const customBtn = document.querySelector('[data-label="Custom"]');
    
    this.customInputOpen = !this.customInputOpen;
    
    if (this.customInputOpen) {
      container.classList.add('open');
      customBtn.classList.add('active');
      // Focus on minutes input first
      const minutesInput = document.getElementById('gbar-custom-minutes');
      minutesInput.focus();
      minutesInput.select();
    } else {
      container.classList.remove('open');
      customBtn.classList.remove('active');
    }
  }
  
  updateCustomTimerSeconds() {
    // Calculate total seconds from minutes and seconds
    const totalSeconds = (this.customMinutes * 60) + this.customSeconds;
    const customBtn = document.querySelector('[data-label="Custom"]');
    if (customBtn && totalSeconds > 0) {
      customBtn.dataset.seconds = totalSeconds;
    }
  }
  
  openModal() {
    const modal = document.getElementById('gbar-modal');
    modal.classList.add('open');
    // Check if update notification should be shown when modal opens
    if (this.latestVersion) {
      this.showUpdateNotificationIfNeeded();
    }
  }
  
  closeModal() {
    const modal = document.getElementById('gbar-modal');
    modal.classList.remove('open');
  }
  
  switchSection(sectionName) {
    // Remove active class from all nav items and sections
    document.querySelectorAll('.gbar-nav-item').forEach((item) => {
      item.classList.remove('active');
    });
    document.querySelectorAll('.gbar-section').forEach((section) => {
      section.classList.remove('active');
    });
    
    // Add active class to selected nav item and section
    const navItem = document.querySelector(`[data-section="${sectionName}"]`);
    const section = document.getElementById(`gbar-section-${sectionName}`);
    
    if (navItem) navItem.classList.add('active');
    if (section) section.classList.add('active');
  }
  
  copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
      // Change icon to checkmark temporarily
      const originalHTML = buttonElement.innerHTML;
      buttonElement.innerHTML = `
        <svg class="gbar-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;
      buttonElement.classList.add('copied');
      
      // Revert after 2 seconds
      setTimeout(() => {
        buttonElement.innerHTML = originalHTML;
        buttonElement.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
  
  applyFontColor() {
    const root = document.documentElement;
    root.style.setProperty('--gbar-font-color', this.fontColor);
  }
  
  selectColor(color) {
    // Update font color
    this.fontColor = color;
    this.applyFontColor();
    this.saveSettings();
    
    // Update preview
    const preview = document.getElementById('gbar-color-preview');
    if (preview) {
      preview.style.backgroundColor = color;
    }
  }
  
  async saveTimers() {
    try {
      const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
      const activeTimers = Array.from(this.timers.values());
      await browserAPI.storage.local.set({ activeTimers });
    } catch (error) {
      console.log('Timer save failed:', error);
    }
  }
  
  async restoreTimers() {
    try {
      const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
      const result = await browserAPI.storage.local.get(['activeTimers']);
      
      if (result.activeTimers && result.activeTimers.length > 0) {
        result.activeTimers.forEach((timerData) => {
          const buttonElement = document.querySelector(`[data-label="${timerData.label}"]`);
          if (buttonElement) {
            // Restore timer data with timestamp-based calculation
            this.timers.set(buttonElement, timerData);
            
            // Update button display
            if (timerData.status === 'running') {
              buttonElement.classList.add('running');
              this.updateButtonDisplay(buttonElement, timerData);
            }
          }
        });
      }
    } catch (error) {
      console.log('Timer restore failed:', error);
    }
  }
  
  startTimer(seconds, buttonElement, label) {
    // Stop existing timer for this button if running
    if (this.timers.has(buttonElement)) {
      this.stopTimer(buttonElement);
    }

    const now = Date.now();
    const timerData = {
      label,
      duration: seconds,
      startTime: now,
      status: 'running'
    };

    this.timers.set(buttonElement, timerData);
    buttonElement.classList.add('running');
    
    // Update display immediately
    this.updateButtonDisplay(buttonElement, timerData);
    
    // Save timer state
    this.saveTimers();
  }
  
  // Removed tick method - no longer needed with timestamp-based system
  
  updateButtonDisplay(buttonElement, timerData) {
    if (timerData.status !== 'running') return;

    const now = Date.now();
    const endTime = timerData.startTime + (timerData.duration * 1000);
    const timeRemaining = Math.max(0, Math.ceil((endTime - now) / 1000));
    
    if (timeRemaining > 0) {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      buttonElement.textContent = `${timerData.label} (${timeString})`;
      
      // Visual warnings
      if (timeRemaining <= 10) {
        buttonElement.style.background = 'linear-gradient(45deg, #ff4444, #ff6666)';
        buttonElement.style.color = '#ffffff';
      } else if (timeRemaining <= 30) {
        buttonElement.style.background = 'linear-gradient(45deg, #ffaa00, #ffcc44)';
        buttonElement.style.color = '#000000';
      }
    } else {
      // Timer should complete
      this.onTimerComplete(buttonElement, timerData);
    }
  }
  
  onTimerComplete(buttonElement, timerData) {
    // Clear the timer
    this.timers.delete(buttonElement);
    
    // Update button display
    buttonElement.textContent = timerData.label;
    buttonElement.classList.remove('running');
    
    // Show notification
    this.showNotification(buttonElement, timerData);
    
    // Play sound
    if (this.soundEnabled) {
      this.playSound();
    }
    
    // Save timer state
    this.saveTimers();
  }
  
  stopTimer(buttonElement) {
    if (this.timers.has(buttonElement)) {
      this.timers.delete(buttonElement);
      buttonElement.classList.remove('running');
      buttonElement.textContent = buttonElement.getAttribute('data-label');
      buttonElement.style.background = '';
      buttonElement.style.color = '';
      buttonElement.style.animation = '';
      buttonElement.disabled = false;
      
      // Save timer state
      this.saveTimers();
    }
  }
  
  playSound() {
    if (!this.soundEnabled) return;
    
    try {
      // Create low-tone ding ding ding sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Play three low-tone dings
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Low tone (around 200Hz)
          oscillator.frequency.value = 200 + (i * 50); // Slight pitch variation
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }, i * 400); // 400ms between each ding
      }
    } catch (error) {
      console.log('GBar: Audio playback not available');
    }
  }
  
  showNotification(buttonElement, timerData) {
    // Disable button during notification
    buttonElement.disabled = true;
    
    // Flash red
    buttonElement.style.background = 'linear-gradient(45deg, #ff0000, #ff4444)';
    buttonElement.style.color = '#ffffff';
    buttonElement.style.animation = 'gbar-flash 0.5s ease-in-out 6';
    
    // Re-enable after 3 seconds
    setTimeout(() => {
      buttonElement.disabled = false;
      buttonElement.style.background = '';
      buttonElement.style.color = '';
      buttonElement.style.animation = '';
    }, 3000);
  }
  
  toggleVisibility() {
    const toolbar = document.getElementById('gbar-toolbar');
    const button = document.getElementById('gbar-toggle');
    
    if (toolbar.classList.contains('collapsed')) {
      // Expand - remove collapsed state immediately to allow animation
      document.documentElement.classList.remove('gbar-collapsed');
      toolbar.classList.remove('collapsed');
      document.body.classList.add('gbar-active');
      document.documentElement.classList.add('gbar-active');
      button.textContent = '×';
      button.classList.remove('expand');
    } else {
      // Collapse - add collapsed state immediately to start animation
      document.documentElement.classList.add('gbar-collapsed');
      toolbar.classList.add('collapsed');
      
      setTimeout(() => {
        document.body.classList.remove('gbar-active');
        document.documentElement.classList.remove('gbar-active');
        
        // Create expand button
        const expandBtn = document.createElement('button');
        expandBtn.className = 'gbar-btn gbar-toggle expand';
        expandBtn.textContent = '◀';
        expandBtn.id = 'gbar-expand';
        expandBtn.title = 'Show GBar';
        document.body.appendChild(expandBtn);
        
        expandBtn.addEventListener('click', () => {
          expandBtn.remove();
          this.toggleVisibility();
        });
      }, 400); // Wait for animation to complete
    }
  }
  
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const soundIcon = document.getElementById('gbar-sound');
    soundIcon.classList.toggle('muted', !this.soundEnabled);
    this.saveSettings();
  }
  
  async loadSettings() {
    try {
      const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
      const result = await browserAPI.storage.local.get(['soundEnabled', 'customMinutes', 'customSeconds', 'fontColor', 'lastUpdateCheck', 'latestVersion']);
      
      if (result.soundEnabled !== undefined) {
        this.soundEnabled = result.soundEnabled;
      }
      if (result.customMinutes !== undefined) {
        this.customMinutes = result.customMinutes;
      }
      if (result.customSeconds !== undefined) {
        this.customSeconds = result.customSeconds;
      }
      // Legacy support: if old customSeconds exists but new format doesn't, convert
      if (result.customMinutes === undefined && result.customSeconds !== undefined && typeof result.customSeconds === 'number' && result.customSeconds > 59) {
        // Convert old seconds format to minutes:seconds
        this.customMinutes = Math.floor(result.customSeconds / 60);
        this.customSeconds = result.customSeconds % 60;
      }
      if (result.fontColor !== undefined) {
        this.fontColor = result.fontColor;
      }
      if (result.lastUpdateCheck !== undefined) {
        this.lastUpdateCheck = result.lastUpdateCheck;
      }
      if (result.latestVersion !== undefined) {
        this.latestVersion = result.latestVersion;
      }
      
      // Apply font color
      document.documentElement.style.setProperty('--gbar-font-color', this.fontColor);
    } catch (error) {
      console.log('Using default settings');
    }
  }
  
  async saveSettings() {
    try {
      const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
      await browserAPI.storage.local.set({ 
        soundEnabled: this.soundEnabled,
        customMinutes: this.customMinutes,
        customSeconds: this.customSeconds,
        fontColor: this.fontColor,
        lastUpdateCheck: this.lastUpdateCheck,
        latestVersion: this.latestVersion
      });
    } catch (error) {
      console.log('Settings save failed:', error);
    }
  }
  
  async checkForUpdates() {
    try {
      // Check at most once per day
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      // Load last check time from storage
      const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
      const result = await browserAPI.storage.local.get(['lastUpdateCheck', 'latestVersion']);
      
      if (result.lastUpdateCheck && (now - result.lastUpdateCheck < oneDay)) {
        // Use cached version if available
        if (result.latestVersion) {
          this.latestVersion = result.latestVersion;
          this.showUpdateNotificationIfNeeded();
        }
        return;
      }
      
      // Fetch latest release from GitHub API
      const response = await fetch('https://api.github.com/repos/robkaltenbach/goku-bar/releases/latest', {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!response.ok) {
        console.log('GBar: Failed to check for updates');
        return;
      }
      
      const release = await response.json();
      // Extract version from tag (e.g., "v1.5.0" -> "1.5.0")
      const latestVersion = release.tag_name.replace(/^v/, '');
      this.latestVersion = latestVersion;
      this.lastUpdateCheck = now;
      
      // Save to storage
      await browserAPI.storage.local.set({
        lastUpdateCheck: now,
        latestVersion: latestVersion
      });
      
      this.showUpdateNotificationIfNeeded();
    } catch (error) {
      console.log('GBar: Update check failed:', error);
    }
  }
  
  showUpdateNotificationIfNeeded() {
    if (!this.latestVersion) return;
    
    // Compare versions (simple string comparison works for semantic versioning)
    if (this.compareVersions(this.currentVersion, this.latestVersion) < 0) {
      const notification = document.getElementById('gbar-update-notification');
      const versionSpan = document.getElementById('gbar-latest-version');
      
      if (notification && versionSpan) {
        versionSpan.textContent = this.latestVersion;
        notification.style.display = 'block';
      }
    }
  }
  
  compareVersions(version1, version2) {
    // Simple version comparison: "1.4.0" vs "1.5.0"
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      
      if (v1part < v2part) return -1;
      if (v1part > v2part) return 1;
    }
    
    return 0;
  }
  
}

// Apply HTML class immediately to prevent layout shift
// This reserves space before the toolbar is rendered
if (document.documentElement) {
  document.documentElement.classList.add('gbar-active');
}

// Check if toolbar already exists (prevents duplicate on soft navigation)
let gbarInitialized = false;

// Initialize the timer immediately to prevent flash
// Early initialization for smooth page transitions
(function() {
  // Prevent duplicate initialization
  if (window.gbarInstance || gbarInitialized) {
    return;
  }
  gbarInitialized = true;
  
  // Wait for body to exist
  const initToolbar = () => {
    if (document.body) {
      // Check again if toolbar already exists
      if (!document.getElementById('gbar-toolbar')) {
        window.gbarInstance = new GBarTimer();
      }
    } else {
      // Body not ready yet, wait a bit
      requestAnimationFrame(initToolbar);
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToolbar);
  } else {
    initToolbar();
  }
})();
