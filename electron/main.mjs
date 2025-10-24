import { app, BrowserWindow, shell } from 'electron';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const isDev = process.env.NODE_ENV === 'development';
const startUrl = process.env.ELECTRON_START_URL;

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#05090f',
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const target = startUrl
    ? startUrl
    : pathToFileURL(join(__dirname, '..', 'dist', 'index.html')).toString();

  mainWindow.loadURL(target);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.whenReady().then(() => {
  app.setAppUserModelId('com.glslplaylab.app');
  createMainWindow();
});
