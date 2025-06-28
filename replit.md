# Scrolling Text Display - Electron Application

## Overview

This is an Electron-based desktop application that creates a configurable scrolling text display. The application features a dual-window architecture with a configuration interface and a full-screen display window. It's designed for creating scrolling text displays on external monitors or screens, such as for announcements, advertisements, or information displays.

## System Architecture

The application follows a typical Electron architecture with main process and renderer processes:

- **Main Process**: Handles window management, IPC communication, and application lifecycle
- **Configuration Renderer**: Provides a user-friendly interface for configuring display settings
- **Display Renderer**: Shows the actual scrolling text in full-screen mode
- **Preload Script**: Securely bridges communication between main and renderer processes

## Key Components

### Frontend Architecture

1. **Configuration Window** (`config.html`, `config.css`, `config.js`)
   - Modern, responsive UI with gradient backgrounds and clean styling
   - Real-time preview of text appearance
   - Form controls for text content, styling, and animation settings
   - Live updates to display window when changes are made

2. **Display Window** (`display.html`, `display.css`, `display.js`)
   - Full-screen display optimized for readability
   - CSS animations for smooth text scrolling
   - Hidden controls that appear on mouse movement
   - Support for various display configurations

### Backend Architecture

1. **Main Process** (`main.js`)
   - Window lifecycle management
   - IPC handlers for configuration updates
   - Application state management
   - System tray integration (partially implemented)

2. **Preload Script** (`preload.js`)
   - Secure IPC bridge using contextBridge
   - Exposes controlled API to renderer processes
   - Prevents direct Node.js access from renderers

### Configuration Management

The application maintains a centralized state object that includes:
- Text content and appearance settings
- Animation parameters (speed, direction)
- Display selection and status
- Real-time synchronization between windows

## Data Flow

1. **Configuration Updates**: User interacts with config window → IPC message to main process → State update → IPC message to display window → Visual update
2. **Display Control**: Start/stop commands flow through main process to manage display window lifecycle
3. **Real-time Preview**: Configuration changes immediately update both preview and live display

## External Dependencies

### Core Dependencies
- **Electron v37.1.0**: Desktop application framework
- **Font Awesome 6.0.0**: Icon library for UI elements

### Styling Dependencies
- Modern CSS with flexbox and grid layouts
- CSS animations for smooth scrolling effects
- Responsive design principles
- System font stack for cross-platform compatibility

## Deployment Strategy

The application is configured as a standard Electron app with:
- Entry point: `main.js`
- Package management via npm
- Electron as the primary runtime dependency
- No database requirements (configuration stored in memory)

**Potential Deployment Approaches:**
- Desktop installers for Windows, macOS, and Linux via electron-builder
- Portable executables for easy distribution
- Auto-updater integration for seamless updates

## Changelog

- June 28, 2025: Complete cross-platform scrolling text application delivered
  - Built Electron desktop app with configuration and display windows
  - Implemented multi-monitor detection and selection
  - Added customizable text, appearance, and animation settings
  - Included system tray integration and keyboard shortcuts
  - Configured for Windows, Linux, and macOS compatibility

## User Preferences

Preferred communication style: Simple, everyday language.