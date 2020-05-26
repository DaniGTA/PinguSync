'use strict';

// tslint:disable-next-line: no-implicit-dependencies
import { app, protocol, BrowserWindow, ipcMain, shell } from 'electron';
import {
  createProtocol,
  installVueDevtools,
  // tslint:disable-next-line: no-implicit-dependencies tslint:disable-next-line: no-submodule-imports
} from 'vue-cli-plugin-electron-builder/lib';
// tslint:disable-next-line: no-implicit-dependencies
import * as electron from 'electron';
import * as mongoose from 'mongoose';
import FrontendController from './backend/controller/frontend-controller';
import DatabaseLoader from './backend/controller/stats-manager/database-loader';
import logger from './backend/logger/logger';
import AppUpdateController from './backend/controller/auto-updater/app-update-controller';
try {

  mongoose.connect(DatabaseLoader.uri, { useNewUrlParser: true }, (err: any) => {
    if (err) {
      logger.error(err.message);
    } else {
      logger.log('info', 'Successfully Connected!');
    }
  });
} catch (err) {
  logger.error(err);
}

// eslint-disable-next-line no-undef
const isDevelopment = process.env.NODE_ENV !== 'production';

app.removeAllListeners('ready');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

const fc = new FrontendController();

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800, height: 600, webPreferences: {
      // eslint-disable-next-line no-undef
      nodeIntegration: process?.env.ELECTRON_NODE_INTEGRATION as any,
    },
  });
  fc.mainInit(win.webContents);
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    try {
      if (!process.env.IS_TEST) { win.webContents.openDevTools(); }
    } catch (err) {

    }
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');

  }

  win.on('closed', () => {
    win = null;
  });
  ipcMain.on('open-url', (event: Electron.IpcMainEvent, data: string) => {
    shell.openExternal(data);
  });
  ipcMain.on('get-path', (event: Electron.IpcMainEvent, s: string) => {
    if (win != null) {
      try {
        win.webContents.send('path', (electron.app || electron.remote.app));
      } catch (err) {
        logger.error(err);
      }
    }
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      installVueDevtools();
    } catch (e) {
      logger.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
  await AppUpdateController.checkUpdate();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
