const { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let configWindow = null;
let displayWindow = null;
let tray = null;

// Store application state
let appState = {
  text: 'Howdy - Welcome to Scrolling Text Display!',
  speed: 20,
  direction: 'left',
  position: 'middle',
  selectedDisplay: 0,
  isRunning: false,
  fontSize: 48,
  thickness: 200,
  textColor: '#ffffff',
  backgroundColor: '#000000'
};

function createConfigWindow() {
  configWindow = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.svg'),
    title: 'Scrolling Text Configuration',
    resizable: true,
    minimizable: true,
    maximizable: false
  });

  configWindow.loadFile('config.html');

  configWindow.on('closed', () => {
    configWindow = null;
  });

  configWindow.on('minimize', () => {
    if (process.platform === 'darwin') {
      configWindow.hide();
    } else {
      configWindow.hide();
    }
  });

  // Send initial data to renderer
  configWindow.webContents.once('did-finish-load', () => {
    configWindow.webContents.send('init-data', {
      appState,
      displays: screen.getAllDisplays()
    });
  });
}

function createDisplayWindow(displayBounds, thickness) {
  if (displayWindow) {
    displayWindow.close();
  }

  height = thickness < displayBounds.height ? thickness : displayBounds.height;
  
  _y = displayBounds.y;
  if (appState.position === 'bottom') {
    _y = displayBounds.height - height;
  } else if (appState.position === 'top') {
    _y = displayBounds.y;
  } else if (appState.position === 'middle') {
    _y = (displayBounds.height/2) - (height/2);
  }

  displayWindow = new BrowserWindow({
    x: displayBounds.x,
    y: _y,
    width: displayBounds.width,
    height: height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    fullscreen: false,
    show: false
  });

  displayWindow.loadFile('display.html');

  displayWindow.webContents.once('did-finish-load', () => {
    displayWindow.webContents.send('display-config', appState);
    displayWindow.show();
  });

  displayWindow.on('closed', () => {
    displayWindow = null;
    appState.isRunning = false;
    if (configWindow) {
      configWindow.webContents.send('status-update', { isRunning: false });
    }
  });
}

function createTray() {
  // Create a simple icon for the tray
  const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.svg'));
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Configuration',
      click: () => {
        if (configWindow) {
          configWindow.show();
          configWindow.focus();
        } else {
          createConfigWindow();
        }
      }
    },
    {
      label: 'Stop Display',
      click: () => {
        if (displayWindow) {
          displayWindow.close();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Scrolling Text Display');

  tray.on('click', () => {
    if (configWindow) {
      configWindow.show();
      configWindow.focus();
    } else {
      createConfigWindow();
    }
  });
}

// IPC handlers
ipcMain.handle('get-displays', () => {
  return screen.getAllDisplays();
});

ipcMain.handle('start-display', (event, config) => {
  appState = { ...appState, ...config, isRunning: true };
  
  const displays = screen.getAllDisplays();
  const selectedDisplay = displays[appState.selectedDisplay] || displays[0];
  
  createDisplayWindow(selectedDisplay.bounds, config.thickness);
  
  return { success: true };
});

ipcMain.handle('stop-display', () => {
  if (displayWindow) {
    displayWindow.close();
  }
  appState.isRunning = false;
  return { success: true };
});

ipcMain.handle('update-config', (event, config) => {
  appState = { ...appState, ...config };
  
  // If display is running, update it
  if (displayWindow && appState.isRunning) {
    displayWindow.webContents.send('display-config', appState);
  }
  
  return { success: true };
});

ipcMain.handle('get-app-state', () => {
  return appState;
});

// App event handlers
app.whenReady().then(() => {
  createConfigWindow();
  createTray();
});

app.on('window-all-closed', () => {
  // Keep app running when all windows are closed (system tray)
});

app.on('activate', () => {
  if (configWindow === null) {
    createConfigWindow();
  }
});

app.on('before-quit', () => {
  if (displayWindow) {
    displayWindow.close();
  }
});
