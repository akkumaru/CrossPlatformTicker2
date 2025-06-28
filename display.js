class ScrollingTextDisplay {
    constructor() {
        this.textElement = document.getElementById('textContent');
        this.container = document.querySelector('.display-container');
        this.controlsOverlay = document.getElementById('controlsOverlay');
        this.closeBtn = document.getElementById('closeBtn');
        
        this.config = {
            text: 'Hello World - Welcome to Scrolling Text Display!',
            fontSize: 48,
            textColor: '#ffffff',
            backgroundColor: '#000000',
            speed: 50,
            direction: 'left'
        };
        
        this.mouseTimer = null;
        this.setupEventListeners();
        this.hideControlsAfterDelay();
    }

    setupEventListeners() {
        // IPC listener for configuration updates
        window.electronAPI.onDisplayConfig((event, config) => {
            this.config = { ...this.config, ...config };
            this.updateDisplay();
        });

        // Mouse movement detection for controls
        document.addEventListener('mousemove', () => {
            this.showControls();
            this.hideControlsAfterDelay();
        });

        // Touch events for mobile/tablet support
        document.addEventListener('touchstart', () => {
            this.showControls();
            this.hideControlsAfterDelay();
        });

        // Close button
        this.closeBtn.addEventListener('click', () => {
            window.close();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Escape':
                    window.close();
                    break;
                case 'F11':
                    e.preventDefault();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAnimation();
                    break;
            }
        });

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.updateDisplay();
        });
    }

    updateDisplay() {
        // Update text content
        this.textElement.textContent = this.config.text || 'Hello World - Welcome to Scrolling Text Display!';
        
        // Update styles
        this.textElement.style.fontSize = `${this.config.fontSize}px`;
        this.textElement.style.color = this.config.textColor;
        this.container.style.backgroundColor = this.config.backgroundColor;
        
        // Update animation
        this.updateAnimation();
    }

    updateAnimation() {
        // Remove existing animation classes
        this.textElement.classList.remove('scroll-left', 'scroll-right');
        
        // Calculate animation duration based on speed (invert for intuitive control)
        const duration = (101 - this.config.speed) * 0.1; // Speed range: 1-10 seconds
        
        // Apply animation
        const animationClass = this.config.direction === 'left' ? 'scroll-left' : 'scroll-right';
        this.textElement.style.animationDuration = `${duration}s`;
        
        // Force reflow to restart animation
        this.textElement.offsetHeight;
        this.textElement.classList.add(animationClass);
    }

    toggleAnimation() {
        const isAnimating = this.textElement.style.animationPlayState !== 'paused';
        this.textElement.style.animationPlayState = isAnimating ? 'paused' : 'running';
    }

    showControls() {
        this.controlsOverlay.classList.add('show');
        document.body.style.cursor = 'default';
    }

    hideControls() {
        this.controlsOverlay.classList.remove('show');
        document.body.style.cursor = 'none';
    }

    hideControlsAfterDelay() {
        clearTimeout(this.mouseTimer);
        this.mouseTimer = setTimeout(() => {
            this.hideControls();
        }, 3000); // Hide after 3 seconds of no mouse movement
    }

    // Initialize with responsive font sizing
    initializeResponsiveFontSize() {
        const updateFontSize = () => {
            const baseSize = this.config.fontSize;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            // Calculate responsive font size based on screen dimensions
            let responsiveSize = baseSize;
            
            // Adjust for smaller screens
            if (screenWidth < 1366) {
                responsiveSize = Math.max(baseSize * 0.8, 24);
            }
            if (screenWidth < 768) {
                responsiveSize = Math.max(baseSize * 0.6, 20);
            }
            
            // Ensure text doesn't exceed screen height
            const maxHeight = screenHeight * 0.8;
            if (responsiveSize > maxHeight) {
                responsiveSize = maxHeight;
            }
            
            this.textElement.style.fontSize = `${responsiveSize}px`;
        };
        
        updateFontSize();
        window.addEventListener('resize', updateFontSize);
    }
}

// Initialize the display when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const display = new ScrollingTextDisplay();
    
    // Handle initial configuration
    window.electronAPI.onDisplayConfig((event, config) => {
        display.config = { ...display.config, ...config };
        display.updateDisplay();
        display.initializeResponsiveFontSize();
    });
});
