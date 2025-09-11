class ScrollingTextConfig {
    constructor() {
        this.displays = [];
        this.appState = {};
        this.initializeElements();
        this.setupEventListeners();
        this.loadInitialData();
    }

    initializeElements() {
        // Form elements
        this.textInput = document.getElementById('textInput');
        this.fontSize = document.getElementById('fontSize');
        this.fontSizeValue = document.getElementById('fontSizeValue');
        this.textColor = document.getElementById('textColor');
        this.backgroundColor = document.getElementById('backgroundColor');
        this.thickness = document.getElementById('thickness');
        this.thicknessValue = document.getElementById('thicknessValue');        
        this.speed = document.getElementById('speed');
        this.speedValue = document.getElementById('speedValue');
        this.direction = document.getElementById('direction');
        this.position = document.getElementById('position');
        this.displaySelect = document.getElementById('displaySelect');
        this.displayInfo = document.getElementById('displayInfo');
        
        // Control elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.statusText = document.getElementById('status-text');
        this.statusDot = document.getElementById('status-dot');
        
        // Preview elements
        this.previewText = document.getElementById('previewText');
    }

    setupEventListeners() {
        // Text input
        this.textInput.addEventListener('input', () => {
            this.updatePreview();
            this.saveConfig();
        });

        // Font size slider
        this.fontSize.addEventListener('input', (e) => {
            this.fontSizeValue.textContent = `${e.target.value}px`;
            this.updatePreview();
            this.saveConfig();
        });

        // Thickness size slider
        this.thickness.addEventListener('input', (e) => {
            this.thicknessValue.textContent = `${e.target.value}px`;
            this.updatePreview();
            this.saveConfig();
        });

        // Speed slider
        this.speed.addEventListener('input', (e) => {
            this.speedValue.textContent = e.target.value;
            this.updatePreview();
            this.saveConfig();
        });

        // Color inputs
        this.textColor.addEventListener('change', () => {
            this.updatePreview();
            this.saveConfig();
        });

        this.backgroundColor.addEventListener('change', () => {
            this.updatePreview();
            this.saveConfig();
        });

        // Direction select
        this.direction.addEventListener('change', (e) => {
            this.updatePreview();
            this.saveConfig();
        });

        // Direction select
        this.position.addEventListener('change', (e) => {
            this.updatePreview();
            this.saveConfig();
        });

        // Display select
        this.displaySelect.addEventListener('change', () => {
            this.updateDisplayInfo();
            this.saveConfig();
        });

        // Control buttons
        this.startBtn.addEventListener('click', () => this.startDisplay());
        this.stopBtn.addEventListener('click', () => this.stopDisplay());

        // IPC listeners
        window.electronAPI.onInitData((event, data) => {
            this.displays = data.displays;
            this.appState = data.appState;
            this.populateDisplays();
            this.loadAppState();
            this.updateStatus();
        });

        window.electronAPI.onStatusUpdate((event, data) => {
            this.appState.isRunning = data.isRunning;
            this.updateStatus();
        });
    }

    async loadInitialData() {
        try {
            this.displays = await window.electronAPI.getDisplays();
            this.appState = await window.electronAPI.getAppState();
            this.populateDisplays();
            this.loadAppState();
            this.updateStatus();
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    populateDisplays() {
        this.displaySelect.innerHTML = '';
        this.displays.forEach((display, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Display ${index + 1} (${display.bounds.width}x${display.bounds.height})`;
            if (display.primary) {
                option.textContent += ' - Primary';
            }
            this.displaySelect.appendChild(option);
        });
        this.updateDisplayInfo();
    }

    loadAppState() {
        this.textInput.value = this.appState.text || '';
        this.fontSize.value = this.appState.fontSize || 48;
        this.fontSizeValue.textContent = `${this.fontSize.value}px`;
        this.thickness.value = this.appState.thickness || 200;
        this.thicknessValue.textContent = `${this.thickness.value}px`;
        this.textColor.value = this.appState.textColor || '#ffffff';
        this.backgroundColor.value = this.appState.backgroundColor || '#000000';
        this.speed.value = this.appState.speed || 50;
        this.speedValue.textContent = this.speed.value;
        this.direction.elements.directionElm.value = this.appState.direction || 'left';
        this.position.elements.positionElm.value = this.appState.position || 'top';
        this.displaySelect.value = this.appState.selectedDisplay || 0;
        
        this.updatePreview();
        this.updateDisplayInfo();
    }

    updateDisplayInfo() {
        const selectedIndex = parseInt(this.displaySelect.value);
        const display = this.displays[selectedIndex];
        
        if (display) {
            const { bounds, scaleFactor, primary } = display;
            this.displayInfo.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <span>
                    Resolution: ${bounds.width}x${bounds.height} | 
                    Position: (${bounds.x}, ${bounds.y}) | 
                    Scale: ${scaleFactor}x
                    ${primary ? ' | Primary Display' : ''}
                </span>
            `;
        }
    }

    updatePreview() {
        const text = this.textInput.value || 'Sample preview text';
        const fontSize = this.fontSize.value;
        const textColor = this.textColor.value;
        const backgroundColor = this.backgroundColor.value;
        const direction = this.direction.elements.directionElm.value;
        const position = this.position.elements.positionElm.value;
        const speed = this.speed.value;

        // Update preview text
        this.previewText.textContent = text;
        this.previewText.style.fontSize = `${Math.min(fontSize * 0.5, 24)}px`;
        this.previewText.style.color = textColor;
        
        // Update preview container
        const container = document.querySelector('.preview-container');
        container.style.backgroundColor = backgroundColor;

        // Update animation
        const animationDuration = 101 - speed; // Invert for intuitive speed control
        const animationDirection = direction === 'left' ? 'scrollLeft' : 'scrollRight';
        
        this.previewText.style.animation = `${animationDirection} ${animationDuration * 0.2}s linear infinite`;
    }

    updateStatus() {
        if (this.appState.isRunning) {
            this.statusText.textContent = 'Running';
            this.statusDot.className = 'status-dot running';
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
        } else {
            this.statusText.textContent = 'Stopped';
            this.statusDot.className = 'status-dot stopped';
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
        }
    }

    async saveConfig() {
        const config = {
            text: this.textInput.value,
            fontSize: parseInt(this.fontSize.value),
            thickness: parseInt(this.thickness.value),
            textColor: this.textColor.value,
            backgroundColor: this.backgroundColor.value,
            speed: parseInt(this.speed.value),
            direction: this.direction.elements.directionElm.value,
            position: this.position.elements.positionElm.value,
            selectedDisplay: parseInt(this.displaySelect.value)
        };

        try {
            await window.electronAPI.updateConfig(config);
        } catch (error) {
            console.error('Failed to save config:', error);
        }
    }

    async startDisplay() {
        const config = {
            text: this.textInput.value,
            fontSize: parseInt(this.fontSize.value),
            textColor: this.textColor.value,
            thickness: parseInt(this.thickness.value),
            backgroundColor: this.backgroundColor.value,
            speed: parseInt(this.speed.value),
            direction: this.direction.elements.directionElm.value,
            position: this.position.elements.positionElm.value,
            selectedDisplay: parseInt(this.displaySelect.value)
        };

        try {
            const result = await window.electronAPI.startDisplay(config);
            if (result.success) {
                this.appState.isRunning = true;
                this.updateStatus();
            }
        } catch (error) {
            console.error('Failed to start display:', error);
            alert('Failed to start display. Please check your settings and try again.');
        }
    }

    async stopDisplay() {
        try {
            const result = await window.electronAPI.stopDisplay();
            if (result.success) {
                this.appState.isRunning = false;
                this.updateStatus();
            }
        } catch (error) {
            console.error('Failed to stop display:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScrollingTextConfig();
});
