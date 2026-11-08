// M10 — Electron Masaüstü Ana Süreci (Windows 10/11 x64, Çoklu Monitör & Çevrimdışı Çalışma)
// Şartname §11 kabul gereksinimleri; KARAR D-23.5 / KARARLAR.md §169.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let secondaryWindow: BrowserWindow | null = null;

function createMainWindow(): BrowserWindow {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1680, width),
    height: Math.min(1050, height),
    minWidth: 1280,
    minHeight: 768,
    title: 'TKGM 3B Sayısal Yapı Modeli (CityGML 2.0)',
    backgroundColor: '#020617', // Slate 950
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Geliştirme veya üretim derlemesini yükle
  if (process.env.ELECTRON_DEV_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_DEV_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (secondaryWindow) {
      secondaryWindow.close();
      secondaryWindow = null;
    }
  });

  return mainWindow;
}

function openSecondaryWindow(panelId = 'viewer3d'): boolean {
  if (secondaryWindow && !secondaryWindow.isDestroyed()) {
    secondaryWindow.focus();
    secondaryWindow.webContents.send('dual-window-event', {
      type: 'DETACH_VIEW',
      panel: panelId,
    });
    return true;
  }

  const displays = screen.getAllDisplays();
  const targetDisplay = displays.length > 1 ? displays[1] : displays[0];
  const { x, y, width, height } = targetDisplay.bounds;

  secondaryWindow = new BrowserWindow({
    x: displays.length > 1 ? x : x + 100,
    y: displays.length > 1 ? y : y + 100,
    width: displays.length > 1 ? width : 1200,
    height: displays.length > 1 ? height : 800,
    title: `TKGM 3B — İkinci Ekran (${panelId.toUpperCase()})`,
    backgroundColor: '#020617',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  const query = `?windowMode=secondary&detachedPanel=${panelId}`;
  if (process.env.ELECTRON_DEV_URL) {
    void secondaryWindow.loadURL(`${process.env.ELECTRON_DEV_URL}${query}`);
  } else {
    void secondaryWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      query: { windowMode: 'secondary', detachedPanel: panelId },
    });
  }

  secondaryWindow.on('closed', () => {
    secondaryWindow = null;
    mainWindow?.webContents.send('dual-window-event', { type: 'REATTACH_VIEW' });
  });

  return true;
}

// IPC Kanalları
ipcMain.handle('get-display-count', () => {
  return screen.getAllDisplays().length;
});

ipcMain.handle('open-secondary-window', (_event, panelId: string) => {
  return openSecondaryWindow(panelId);
});

ipcMain.handle('close-secondary-window', () => {
  if (secondaryWindow && !secondaryWindow.isDestroyed()) {
    secondaryWindow.close();
    secondaryWindow = null;
  }
});

ipcMain.on('send-dual-window-event', (_event, msg) => {
  // Pencereler arası olayı yayınla
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('dual-window-event', msg);
  }
  if (secondaryWindow && !secondaryWindow.isDestroyed()) {
    secondaryWindow.webContents.send('dual-window-event', msg);
  }
});

// Dosya Seçme / Kaydetme Diyalogları
ipcMain.handle('show-open-dialog', async (_event, options) => {
  if (!mainWindow) return { canceled: true, filePaths: [] };
  return dialog.showOpenDialog(mainWindow, options);
});

ipcMain.handle('show-save-dialog', async (_event, options) => {
  if (!mainWindow) return { canceled: true, filePath: undefined };
  return dialog.showSaveDialog(mainWindow, options);
});

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
