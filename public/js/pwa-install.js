// PWA Install Manager
class PWAInstallManager {
    constructor() {
        this.deferredPrompt = null;
        this.installBanner = null;
        this.isInstalled = this.checkIfInstalled();
        this.hasShownPrompt = this.getPromptShownState();
        
        this.init();
    }

    init() {
        // Only show prompt if not already installed and not shown recently
        if (!this.isInstalled && !this.hasShownPrompt) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            
            // Show prompt after a delay to not interrupt user
            setTimeout(() => {
                this.showInstallPrompt();
            }, 3000);
        });

        // Listen for successful installation
        window.addEventListener('appinstalled', () => {
            this.onAppInstalled();
        });
    }

    showInstallPrompt() {
        // Don't show if already installed or recently dismissed
        if (this.isInstalled || this.hasShownPrompt) {
            return;
        }

        // Create beautiful install banner
        this.installBanner = document.createElement('div');
        this.installBanner.id = 'pwa-install-banner';
        this.installBanner.className = 'pwa-install-banner';
        
        this.installBanner.innerHTML = `
            <div class="pwa-install-icon">
                <img src="/icons/icon-96x96.png" alt="Blupension" />
            </div>
            <div class="pwa-install-content">
                <div class="pwa-install-title">Install Blupension</div>
                <div class="pwa-install-subtitle">Get quick access to your pension dashboard and manage investments on the go</div>
            </div>
            <div class="pwa-install-actions">
                <button class="pwa-install-btn" onclick="pwaManager.installApp()">
                    Install App
                </button>
                <button class="pwa-dismiss-btn" onclick="pwaManager.dismissInstall()">
                    Maybe Later
                </button>
            </div>
        `;

        document.body.appendChild(this.installBanner);

        // Auto-dismiss after 30 seconds
        setTimeout(() => {
            if (this.installBanner && this.installBanner.parentNode) {
                this.dismissInstall();
            }
        }, 30000);
    }

    async installApp() {
        if (!this.deferredPrompt) {
            return;
        }

        // Show loading state
        const installBtn = this.installBanner.querySelector('.pwa-install-btn');
        const originalText = installBtn.textContent;
        installBtn.textContent = 'Installing...';
        this.installBanner.classList.add('pwa-install-loading');

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const choiceResult = await this.deferredPrompt.userChoice;
            
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                this.showSuccessMessage();
            } else {
                console.log('User dismissed the install prompt');
                this.dismissInstall();
            }
        } catch (error) {
            console.error('Error during installation:', error);
            this.dismissInstall();
        } finally {
            // Reset loading state
            installBtn.textContent = originalText;
            this.installBanner.classList.remove('pwa-install-loading');
            
            // Clear the deferred prompt
            this.deferredPrompt = null;
        }
    }

    dismissInstall() {
        if (this.installBanner) {
            this.installBanner.classList.add('dismissing');
            
            setTimeout(() => {
                if (this.installBanner && this.installBanner.parentNode) {
                    this.installBanner.parentNode.removeChild(this.installBanner);
                }
                this.installBanner = null;
            }, 300);
        }

        // Remember that we've shown the prompt
        this.setPromptShownState(true);
    }

    showSuccessMessage() {
        if (this.installBanner) {
            this.installBanner.classList.add('pwa-install-success');
            this.installBanner.querySelector('.pwa-install-title').textContent = 'Installation Successful!';
            this.installBanner.querySelector('.pwa-install-subtitle').textContent = 'Blupension has been installed on your device';
            
            // Remove action buttons
            const actions = this.installBanner.querySelector('.pwa-install-actions');
            if (actions) {
                actions.innerHTML = `
                    <button class="pwa-dismiss-btn" onclick="pwaManager.dismissInstall()">
                        Got it!
                    </button>
                `;
            }

            // Auto-dismiss after 3 seconds
            setTimeout(() => {
                this.dismissInstall();
            }, 3000);
        }
    }

    onAppInstalled() {
        console.log('PWA was installed');
        this.isInstalled = true;
        this.setInstalledState(true);
        
        // Show success message if banner is still visible
        if (this.installBanner) {
            this.showSuccessMessage();
        }
    }

    // Check if app is already installed
    checkIfInstalled() {
        // Check localStorage for installation state
        const installed = localStorage.getItem('pwa-installed');
        if (installed === 'true') {
            return true;
        }

        // Check if running in standalone mode (installed PWA)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.setInstalledState(true);
            return true;
        }

        // Check if running in fullscreen mode
        if (window.navigator.standalone === true) {
            this.setInstalledState(true);
            return true;
        }

        return false;
    }

    // Set installation state
    setInstalledState(installed) {
        localStorage.setItem('pwa-installed', installed.toString());
    }

    // Check if prompt was recently shown
    getPromptShownState() {
        const lastShown = localStorage.getItem('pwa-prompt-shown');
        if (!lastShown) {
            return false;
        }

        // Check if it was shown more than 7 days ago
        const lastShownDate = new Date(lastShown);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        return lastShownDate > sevenDaysAgo;
    }

    // Set prompt shown state
    setPromptShownState(shown) {
        if (shown) {
            localStorage.setItem('pwa-prompt-shown', new Date().toISOString());
        } else {
            localStorage.removeItem('pwa-prompt-shown');
        }
    }

    // Reset prompt state (for testing)
    resetPromptState() {
        localStorage.removeItem('pwa-prompt-shown');
        localStorage.removeItem('pwa-installed');
        this.hasShownPrompt = false;
        this.isInstalled = false;
    }
}

// Initialize PWA Install Manager
let pwaManager;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        pwaManager = new PWAInstallManager();
    });
} else {
    pwaManager = new PWAInstallManager();
}

// Export for global access
window.pwaManager = pwaManager; 