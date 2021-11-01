/* eslint-disable no-restricted-syntax */
/* eslint-disable promise/always-return */
/* eslint global-require: off, no-console: off */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { app, BrowserWindow, Menu, Tray, ipcMain } from 'electron';
import { IpcMainEvent } from 'electron/main';
import * as Preference from '../libs/Preference';
import { getAssetPath } from './util';
import { formatTime } from '../renderer/views/util';
import { CURRENT_ID } from '../constants';
import createSettingWindow from './setting';
import AppUpdater from '../libs/AppUpdater';
import ReactBrowserWindow from '../libs/ReactBrowserWindow';
import DB from '../libs/DB';
import ScheduleTimer from '../libs/ScheduleTimer';
import store from '../libs/ElectronStore';

const { screen } = require('electron');

const scheduleTimer = ScheduleTimer.getInstance();

Preference.init();

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let childWindow: BrowserWindow | null = null;
const externalWindows: BrowserWindow[] = [];

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}
if (isDevelopment) {
  require('electron-debug')();
}

const mainOption = {
  frame: false,
  resizable: false,
  movable: false,
  transparent: true,
  backgroundColor: '#80000000',
  enableLargerThanScreen: true,
  autoHideMenuBar: true,
};

const hideOverlay = () => {
  mainWindow?.hide();
  childWindow?.hide();
  for (const window of externalWindows) {
    window?.hide();
  }
};

const showOverlay = () => {
  mainWindow?.show();
  mainWindow?.focus();
  mainWindow?.setPosition(0, 0, false);
  mainWindow?.setOpacity(0.2);
  mainWindow?.setAlwaysOnTop(true, 'screen-saver');

  const displays = screen.getAllDisplays();
  console.log(displays);
  for (let i = 0; i < displays.length; i++) {
    if (displays[i].bounds.x !== 0 || displays[i].bounds.y !== 0) {
      const { x, y } = displays[i].bounds;
      const { width, height } = displays[i].size;
      const { browserWindow: window } = ReactBrowserWindow.CreateWindow({
        ...mainOption,
        x,
        y,
        width,
        height,
        pathname: '#/?external',
      });
      window?.show();
      externalWindows.push(<BrowserWindow>window);
    }
  }

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
        autoHideMenuBar: true,
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
        for (const win of externalWindows) {
          win.setOpacity(opacity + 0.02);
        }
      } else {
        clearInterval(opacityInterval);
      }
    }
  }, 800);
};

scheduleTimer.on('countdown', (timeLeft: number) => {
  tray?.setTitle(formatTime(timeLeft));
  ReactBrowserWindow.send('countdown', timeLeft);
});
scheduleTimer.on('break', (status) => {
  ReactBrowserWindow.send('status', status);
  // 强制休息
  showOverlay();
});
scheduleTimer.on('working', (status) => {
  ReactBrowserWindow.send('status', status);
  // 结束强制休息
  hideOverlay();
});

/**
 * 禁用当前schedule,同时通知render线程更新当前正在运行的id
 */
const disableSchedule = () => {
  scheduleTimer.disable();
  store.set(CURRENT_ID, 0);
  ReactBrowserWindow.send('updateCurrentId', 0);
};

const handleSettingClick = async () => {
  await createSettingWindow();
};

const handleQuitClick = () => {
  app.quit();
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
  scheduleTimer.start({ workTime, breakTime, delayTime });
};

const createWindow = async () => {
  // eslint-disable-next-line no-new
  new AppUpdater();

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const reactBrowserWindow = ReactBrowserWindow.CreateWindow({
    ...mainOption,
    width,
    height,
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
  if (process.platform === 'darwin') {
    app.dock.setIcon(getAssetPath('icon.png'));
  }
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

/**
 * 暂停当前计划，只能从工作状态暂停，进入暂停状态
 */
ipcMain.on('pauseSchedule', () => {
  scheduleTimer.pause();
});

/**
 * 恢复当前计划，只能从暂停状态进入工作状态
 */
ipcMain.on('resumeSchedule', () => {
  scheduleTimer.resume();
});

ipcMain.on('break', () => {
  scheduleTimer.break();
  showOverlay();
});

/**
 * 强制跳过计划，只能从休息状态下跳过休息，进入工作状态
 */
ipcMain.on('skipSchedule', () => {
  scheduleTimer.skip();
  ReactBrowserWindow.send('status', scheduleTimer.globalStatus);
  hideOverlay();
});

/**
 * 强制推迟计划，只能从休息状态推迟，进入推迟状态
 */
ipcMain.on('postponeSchedule', () => {
  scheduleTimer.postpone();
  hideOverlay();
});

ipcMain.on('disableSchedule', disableSchedule);

ipcMain.on('startSchedule', (_: IpcMainEvent, id: number) => {
  if (!store.has(CURRENT_ID)) {
    setupTimeoutById(id);
  } else if (store.get(CURRENT_ID) !== id) {
    disableSchedule();
    setupTimeoutById(id);
  }
});

ipcMain.on('getStatus', (event: IpcMainEvent) => {
  event.returnValue = scheduleTimer.globalStatus;
});
