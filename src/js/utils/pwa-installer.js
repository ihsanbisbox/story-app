// PWA Installation Handler
class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.installButton = null;
    this.isInstalled = false;
    this.init();
  }

  init() {
    this.checkInstallation();
    this.setupEventListeners();
    this.createInstallButton();
  }

  // Cek apakah PWA sudah terinstall
  checkInstallation() {
    // Cek standalone mode (sudah terinstall)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('PWA sudah terinstall dan berjalan dalam mode standalone');
      return;
    }

    // Cek iOS Safari
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('PWA sudah terinstall di iOS Safari');
      return;
    }

    // Cek browser yang mendukung installation
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('Browser mendukung PWA features');
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Listen untuk beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event triggered');
      // Prevent default browser install prompt
      e.preventDefault();
      // Store the event untuk digunakan nanti
      this.deferredPrompt = e;
      // Show install button
      this.showInstallButton();
    });

    // Listen untuk appinstalled event
    window.addEventListener('appinstalled', (e) => {
      console.log('PWA berhasil terinstall', e);
      this.isInstalled = true;
      this.hideInstallButton();
      this.showInstallSuccess();
    });

    // Listen untuk perubahan display mode
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      if (e.matches) {
        console.log('PWA berjalan dalam standalone mode');
        this.isInstalled = true;
      }
    });
  }

  // Create install button
  createInstallButton() {
    // Buat install button jika belum ada
    if (!document.getElementById('pwa-install-btn')) {
      const installBtn = document.createElement('button');
      installBtn.id = 'pwa-install-btn';
      installBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
        Install App
      `;
      installBtn.className = 'pwa-install-button';
      installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2196F3;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 50px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 20px rgba(33, 150, 243, 0.3);
        transition: all 0.3s ease;
        z-index: 1000;
        display: none;
      `;

      // Hover effects
      installBtn.addEventListener('mouseenter', () => {
        installBtn.style.transform = 'translateY(-2px)';
        installBtn.style.boxShadow = '0 6px 25px rgba(33, 150, 243, 0.4)';
      });

      installBtn.addEventListener('mouseleave', () => {
        installBtn.style.transform = 'translateY(0)';
        installBtn.style.boxShadow = '0 4px 20px rgba(33, 150, 243, 0.3)';
      });

      // Click handler
      installBtn.addEventListener('click', () => {
        this.installPWA();
      });

      document.body.appendChild(installBtn);
      this.installButton = installBtn;
    }
  }

  // Show install button
  showInstallButton() {
    if (this.installButton && !this.isInstalled) {
      this.installButton.style.display = 'flex';
      
      // Animate in
      setTimeout(() => {
        this.installButton.style.opacity = '1';
        this.installButton.style.transform = 'translateY(0)';
      }, 100);
    }
  }

  // Hide install button
  hideInstallButton() {
    if (this.installButton) {
      this.installButton.style.display = 'none';
    }
  }

  // Install PWA
  async installPWA() {
    if (this.deferredPrompt) {
      // Show install prompt
      this.deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User menerima install PWA');
        this.showInstallProgress();
      } else {
        console.log('User menolak install PWA');
        this.showInstallRejected();
      }
      
      // Clear deferred prompt
      this.deferredPrompt = null;
      this.hideInstallButton();
    } else {
      // Fallback untuk browser yang tidak support
      this.showManualInstallInstructions();
    }
  }

  // Show install progress
  showInstallProgress() {
    this.showNotification('Menginstall DStory...', 'info');
  }

  // Show install success
  showInstallSuccess() {
    this.showNotification('DStory berhasil terinstall! 🎉', 'success');
  }

  // Show install rejected
  showInstallRejected() {
    this.showNotification('Install dibatalkan. Kamu bisa install nanti dari menu browser.', 'warning');
  }

  // Show manual install instructions
  showManualInstallInstructions() {
    const instructions = this.getManualInstallInstructions();
    this.showModal('Cara Install DStory', instructions);
  }

  // Get manual install instructions based on browser/device
  getManualInstallInstructions() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return `
        <div class="install-instructions">
          <h3>Chrome Desktop:</h3>
          <ol>
            <li>Klik ikon install (⬇️) di address bar</li>
            <li>Atau klik menu (⋮) → "Install DStory"</li>
          </ol>
          
          <h3>Chrome Mobile:</h3>
          <ol>
            <li>Klik menu (⋮) di pojok kanan atas</li>
            <li>Pilih "Add to Home screen"</li>
            <li>Klik "Add"</li>
          </ol>
        </div>
      `;
    } else if (userAgent.includes('safari') && userAgent.includes('iphone')) {
      return `
        <div class="install-instructions">
          <h3>Safari iOS:</h3>
          <ol>
            <li>Klik tombol Share (□↗) di bawah</li>
            <li>Scroll dan pilih "Add to Home Screen"</li>
            <li>Klik "Add" di pojok kanan atas</li>
          </ol>
        </div>
      `;
    } else if (userAgent.includes('firefox')) {
      return `
        <div class="install-instructions">
          <h3>Firefox:</h3>
          <ol>
            <li>Klik menu (☰) di pojok kanan atas</li>
            <li>Pilih "Install DStory"</li>
            <li>Klik "Install"</li>
          </ol>
        </div>
      `;
    } else {
      return `
        <div class="install-instructions">
          <p>Untuk menginstall DStory sebagai aplikasi:</p>
          <ol>
            <li>Cari opsi "Install" atau "Add to Home Screen" di menu browser</li>
            <li>Ikuti instruksi yang muncul</li>
          </ol>
          <p>Setiap browser memiliki cara yang sedikit berbeda.</p>
        </div>
      `;
    }
  }

  // Show notification
  showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.getElementById('pwa-notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'pwa-notification';
    notification.className = `pwa-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      z-index: 1001;
      max-width: 300px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    // Set background color based on type
    const colors = {
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#f44336'
    };
    notification.style.background = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          notification.remove();
        }, 300);
      }
    }, 5000);
  }

  // Show modal
  showModal(title, content) {
    // Remove existing modal
    const existing = document.getElementById('pwa-modal');
    if (existing) {
      existing.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'pwa-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>${title}</h2>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
        </div>
      </div>
    `;
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1002;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Add modal styles
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
      .modal-overlay {
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .modal-content {
        background: white;
        border-radius: 16px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      .modal-header {
        padding: 24px 24px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-header h2 {
        margin: 0;
        color: #333;
      }
      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .modal-close:hover {
        background: #f5f5f5;
        color: #333;
      }
      .modal-body {
        padding: 24px;
      }
      .install-instructions h3 {
        color: #333;
        margin: 16px 0 8px;
      }
      .install-instructions ol {
        margin: 8px 0 16px 20px;
        color: #666;
      }
      .install-instructions li {
        margin: 4px 0;
        line-height: 1.5;
      }
    `;
    document.head.appendChild(modalStyles);

    document.body.appendChild(modal);

    // Show modal
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 100);

    // Close handlers
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    closeBtn.addEventListener('click', () => this.closeModal(modal));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeModal(modal);
      }
    });

    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modal);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  // Close modal
  closeModal(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 300);
  }

  // Check if PWA features are supported
  static isSupported() {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'caches' in window;
  }

  // Get PWA installation status
  getInstallationStatus() {
    return {
      isInstalled: this.isInstalled,
      canInstall: this.deferredPrompt !== null,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isIOS: window.navigator.standalone !== undefined
    };
  }
}

// Initialize PWA Installer
document.addEventListener('DOMContentLoaded', () => {
  if (PWAInstaller.isSupported()) {
    window.pwaInstaller = new PWAInstaller();
    console.log('PWA Installer initialized');
  } else {
    console.log('PWA features not supported in this browser');
  }
});

// Export for use in other modules
export default PWAInstaller;