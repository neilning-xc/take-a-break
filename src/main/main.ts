/* eslint-disable promise/always-return */
/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { app, BrowserWindow, Menu, Tray, ipcMain } from 'electron';
import { getAssetPath } from './util';
import config from '../config.json';
import { formatTime } from '../renderer/views/util';
import { STATUS } from '../constants';
import createSettingWindow from './setting';
import AppUpdater from '../libs/AppUpdater';
import ReactBrowserWindow from '../libs/ReactBrowserWindow';
import DB from '../libs/DB';

type Timer = NodeJS.Timeout | null;

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const configs = DB().table('schedule').findAll();
const { workTime, breakTime } = configs[0];

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let globalTimer: Timer = null;
let globalStatus = STATUS.closed;
let startTime = 0;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}
if (isDevelopment) {
  require('electron-debug')();
}

// 获取当时时间戳
const getTimestamp = () => {
  return Math.floor(new Date().getTime() / 1000);
};

const hideOverlay = () => {
  mainWindow?.hide();
};

const showOverlay = () => {
  // Create a window that fills the screen's available work area.
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow?.show();
  mainWindow?.focus();
  mainWindow?.setSize(width, height, true);
  mainWindow?.setPosition(0, 0, true);
  // mainWindow?.setOpacity(0.5);
  mainWindow?.setAlwaysOnTop(true);
};

const skipBreak = () => {
  if (globalStatus === STATUS.breaking) {
    globalStatus = STATUS.working;
    startTime = getTimestamp();
    mainWindow?.webContents.send('status', globalStatus);
    hideOverlay();
  }
};

const postponeBreak = () => {
  if (globalStatus === STATUS.breaking) {
    globalStatus = STATUS.delaying;
    startTime = getTimestamp();
    hideOverlay();
  }
};

const handleSettingClick = () => {
  createSettingWindow();
};

const handleQuitClick = () => {
  app.quit();
};

const setupTimeout = () => {
  if (globalTimer === null) {
    startTime = getTimestamp();
    globalStatus = STATUS.working;
    globalTimer = setInterval(() => {
      const currentTime = getTimestamp();
      let timeLeft = 0;
      if (globalStatus === STATUS.working) {
        timeLeft = workTime - (currentTime - startTime);
        if (currentTime - startTime >= workTime) {
          // 工作时间结束，开始休息
          startTime = currentTime;
          globalStatus = STATUS.breaking;
          mainWindow?.webContents.send('status', STATUS.breaking);

          // 强制休息
          showOverlay();
        }
      }
      if (globalStatus === STATUS.breaking) {
        timeLeft = breakTime - (currentTime - startTime);
        if (currentTime - startTime >= breakTime) {
          // 休息结束，开始工作
          startTime = currentTime;
          globalStatus = STATUS.working;
          mainWindow?.webContents.send('status', STATUS.working);

          // 结束强制休息
          hideOverlay();
        }
      }

      if (globalStatus === STATUS.delaying) {
        timeLeft = config.delayTime - (currentTime - startTime);
        if (currentTime - startTime >= config.delayTime) {
          // 工作时间结束，开始休息
          startTime = currentTime;
          globalStatus = STATUS.breaking;
          mainWindow?.webContents.send('status', STATUS.breaking);

          // 强制休息
          showOverlay();
        }
      }

      tray?.setTitle(formatTime(timeLeft));
      mainWindow?.webContents.send('countdown', timeLeft);
    }, 1000);
  }
};

const createWindow = async () => {
  // Remove this if your app does not use auto updates
  // eslint-disable-next-line no-new
  new AppUpdater();

  const reactBrowserWindow = ReactBrowserWindow.CreateWindow();
  mainWindow = reactBrowserWindow.browserWindow;
  mainWindow?.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"browserWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    }
  });
};

const init = async () => {
  await createWindow();
  setupTimeout();
};

// Create system tray
const createTray = () => {
  if (tray == null) {
    tray = new Tray(getAssetPath('icons/16x16.png'));
    tray.setToolTip('Take a break');
    const contextMenu = Menu.buildFromTemplate([
      { label: '设置', type: 'normal', click: handleSettingClick },
      { label: '退出', type: 'normal', click: handleQuitClick },
    ]);
    tray.setContextMenu(contextMenu);
  }
};

/**
 * Add event listeners...
 */
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  } else {
    app.dock.hide();
  }
});

app
  .whenReady()
  .then(init)
  .then(() => {
    createTray();
  })
  .then(() => {
    // app.dock.hide();
  })
  .catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

ipcMain.on('skipBreak', () => {
  skipBreak();
});

ipcMain.on('postponeBreak', () => {
  postponeBreak();
});
