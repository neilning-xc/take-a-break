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
import { IpcMainEvent } from 'electron/main';
import Store from 'electron-store';
import { getAssetPath } from './util';
import { formatTime } from '../renderer/views/util';
import { CURRENT_ID, STATUS } from '../constants';
import createSettingWindow from './setting';
import AppUpdater from '../libs/AppUpdater';
import ReactBrowserWindow from '../libs/ReactBrowserWindow';
import DB from '../libs/DB';

const { screen } = require('electron');

const store = new Store();

type Timer = NodeJS.Timeout | null;

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let childWindow: BrowserWindow | null = null;
let globalTimer: Timer = null;
let globalStatus = STATUS.closed;
let startTime = 0; // 记录点击开始按钮时的时间
let pausedTime = 0; // 记录点击暂停按钮时的时间

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
  childWindow?.hide();
};

const showOverlay = () => {
  mainWindow?.show();
  mainWindow?.focus();
  mainWindow?.setPosition(0, 0, false);
  mainWindow?.setOpacity(0.5);
  mainWindow?.setAlwaysOnTop(true, 'screen-saver');

  if (mainWindow) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenW, height: screenH } = primaryDisplay.size;
    const width = 250;
    const height = 150;
    const offsetX = 0;
    const offsetY = 100;
    const x = screenW / 2 - width / 2 + offsetX;
    const y = screenH / 2 - height / 2 + offsetY;

    if (childWindow === null) {
      const child = ReactBrowserWindow.CreateWindow({
        frame: false,
        resizable: process.env.NODE_ENV === 'development',
        movable: process.env.NODE_ENV === 'development',
        parent: mainWindow,
        width,
        height,
        x,
        y,
        backgroundColor: '#FFFFFF',
        hasShadow: false,
        pathname: '#/action',
        transparent: true,
        opacity: 0.8,
      });
      childWindow = child.browserWindow;
    }
    childWindow?.show();
    childWindow?.setAlwaysOnTop(true, 'screen-saver');
  }

  const opacityInterval = setInterval(() => {
    if (mainWindow) {
      const opacity = mainWindow.getOpacity();
      if (opacity < 0.8) {
        mainWindow.setOpacity(opacity + 0.02);
      } else {
        clearInterval(opacityInterval);
      }
    }
  }, 800);
};

/**
 * 暂停当前计划，只能从工作状态暂停，进入暂停状态
 */
const pauseSchedule = () => {
  if (globalStatus === STATUS.working) {
    globalStatus = STATUS.paused;
    pausedTime = getTimestamp();
  }
};

/**
 * 恢复当前计划，只能从暂停状态进入工作状态
 */
const resumeSchedule = () => {
  if (globalStatus === STATUS.paused) {
    globalStatus = STATUS.working;
    const currentTime = getTimestamp();
    // 设置新的开始时间，以便恢复工作状态时，能够重新得到暂停前的剩余时间
    startTime += currentTime - pausedTime;
  }
};

/**
 * 强制跳过计划，只能从休息状态下跳过休息，进入工作状态
 */
const skipSchedule = () => {
  if (globalStatus === STATUS.breaking) {
    globalStatus = STATUS.working;
    startTime = getTimestamp();
    ReactBrowserWindow.send('status', globalStatus);
    hideOverlay();
  }
};

/**
 * 强制推迟计划，只能从休息状态推迟，进入推迟状态
 */
const postponeSchedule = () => {
  if (globalStatus === STATUS.breaking) {
    globalStatus = STATUS.delaying;
    startTime = getTimestamp();
    hideOverlay();
  }
};

/**
 * 禁用当前schedule,同时通知render线程更新当前正在运行的id
 */
const disableSchedule = () => {
  if (globalTimer) {
    clearInterval(globalTimer);
    globalTimer = null;
    store.delete(CURRENT_ID);
    ReactBrowserWindow.send('updateCurrentId', 0);
  }
};

const handleSettingClick = async () => {
  await createSettingWindow();
};

const handleQuitClick = () => {
  app.quit();
};

const setupTimeout = (params: {
  workTime: number;
  breakTime: number;
  delayTime: number;
}) => {
  const { workTime, breakTime, delayTime } = params;
  if (globalTimer === null) {
    startTime = getTimestamp();
    globalStatus = STATUS.working;
    globalTimer = setInterval(() => {
      const currentTime = getTimestamp();
      let timeLeft = 0;

      // 处理工作状态倒计时
      if (globalStatus === STATUS.working) {
        timeLeft = workTime - (currentTime - startTime);
        if (currentTime - startTime >= workTime) {
          // 工作时间结束，开始休息
          startTime = currentTime;
          globalStatus = STATUS.breaking;
          ReactBrowserWindow.send('status', STATUS.breaking);

          // 强制休息
          showOverlay();
        }
      }

      // 处理休息状态的倒计时，休息结束时转换为工作状态
      if (globalStatus === STATUS.breaking) {
        timeLeft = breakTime - (currentTime - startTime);
        if (currentTime - startTime >= breakTime) {
          // 休息结束，开始工作
          startTime = currentTime;
          globalStatus = STATUS.working;
          ReactBrowserWindow.send('status', STATUS.working);

          // 结束强制休息
          hideOverlay();
        }
      }

      // 处理推迟状态下的倒计时，推迟结束时，转换为休息状态
      if (globalStatus === STATUS.delaying) {
        timeLeft = delayTime - (currentTime - startTime);
        if (currentTime - startTime >= delayTime) {
          // 工作时间结束，开始休息
          startTime = currentTime;
          globalStatus = STATUS.breaking;
          ReactBrowserWindow.send('status', STATUS.breaking);

          // 开始强制休息
          showOverlay();
        }
      }

      if (globalStatus === STATUS.paused) {
        timeLeft = workTime - (pausedTime - startTime);
      }

      tray?.setTitle(formatTime(timeLeft));
      ReactBrowserWindow.send('countdown', timeLeft);
    }, 1000);
  }
};

const setupTimeoutById = (id: number) => {
  const schedule = DB('schedule').findById(id);
  if (!schedule) {
    throw new Error('schedule does not exist');
  }
  store.set(CURRENT_ID, id);
  // 通知render线程更新currentId
  ReactBrowserWindow.send('updateCurrentId', id);
  const { workTime, breakTime, delayTime } = schedule as Schedule;
  setupTimeout({ workTime, breakTime, delayTime });
};

const createWindow = async () => {
  // Remove this if your app does not use auto updates
  // eslint-disable-next-line no-new
  new AppUpdater();

  // Create a window that fills the screen's available work area.
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const reactBrowserWindow = ReactBrowserWindow.CreateWindow({
    frame: false,
    resizable: false,
    movable: false,
    transparent: true,
    backgroundColor: '#80000000',
    width,
    height,
    autoHideMenuBar: true,
    enableLargerThanScreen: true,
  });
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

  const count = DB('schedule').count();
  if (count > 0) {
    if (store.has(CURRENT_ID)) {
      setupTimeoutById(<number>store.get(CURRENT_ID));
    } else {
      const firstSchedule = DB('schedule').first();
      setupTimeoutById(firstSchedule.id);
    }
  }
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
    // 开发环境时，为了便于调试，不隐藏dock图标
    if (process.env.NODE_ENV === 'production') {
      app.dock.hide();
    }
  })
  .catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

/////////////////////////////////////////
//         异步的主线程监听事件           //
////////////////////////////////////////
ipcMain.on('pauseSchedule', () => {
  pauseSchedule();
});

ipcMain.on('resumeSchedule', () => {
  resumeSchedule();
});

ipcMain.on('skipSchedule', () => {
  skipSchedule();
});

ipcMain.on('postponeSchedule', () => {
  postponeSchedule();
});

ipcMain.on('disableSchedule', () => {
  disableSchedule();
});

ipcMain.on('startSchedule', (_: IpcMainEvent, id: number) => {
  if (!store.has(CURRENT_ID)) {
    setupTimeoutById(id);
  } else if (store.get(CURRENT_ID) !== id) {
    disableSchedule();
    setupTimeoutById(id);
  }
});

ipcMain.on('getStatus', (event: IpcMainEvent) => {
  event.returnValue = globalStatus;
});
