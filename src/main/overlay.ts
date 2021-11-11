/* eslint-disable no-restricted-syntax */
/* eslint-disable promise/always-return */
/* eslint global-require: off, no-console: off */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { BrowserWindow, ipcMain, screen } from 'electron';
import { IpcMainEvent } from 'electron/main';
import { CURRENT_ID } from '../constants';
import ReactBrowserWindow from '../libs/ReactBrowserWindow';
import DB from '../libs/DB';
import ScheduleTimer from '../libs/ScheduleTimer';
import store from '../libs/ElectronStore';

// 获取schedule线程实例
const scheduleTimer = ScheduleTimer.getInstance();

let overlayWindow: BrowserWindow | null = null;
let childWindow: BrowserWindow | null = null;
const externalWindows: BrowserWindow[] = [];

const mainOption = {
  frame: false,
  resizable: false,
  movable: false,
  transparent: true,
  backgroundColor: '#80000000',
  enableLargerThanScreen: true,
  autoHideMenuBar: true,
};

const createOverlayWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const reactBrowserWindow = ReactBrowserWindow.CreateWindow({
    ...mainOption,
    width,
    height,
  });
  overlayWindow = reactBrowserWindow.browserWindow;
};

const hideOverlay = () => {
  overlayWindow?.hide();
  childWindow?.hide();
  for (const window of externalWindows) {
    window?.hide();
  }
};

const showOverlay = () => {
  if (overlayWindow === null) {
    createOverlayWindow();
  }
  overlayWindow?.show();
  overlayWindow?.focus();
  overlayWindow?.setPosition(0, 0, false);
  overlayWindow?.setOpacity(0.2);
  overlayWindow?.setAlwaysOnTop(true, 'screen-saver');

  const displays = screen.getAllDisplays();

  // 避免重复创建窗口
  if (displays.length !== externalWindows.length) {
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
          opacity: 0.2,
        });
        window?.setAlwaysOnTop(true, 'screen-saver');
        window?.show();
        externalWindows.push(<BrowserWindow>window);
      }
    }
  } else {
    for (const window of externalWindows) {
      if (window && window.isDestroyed()) {
        window?.setAlwaysOnTop(true, 'screen-saver');
        window?.show();
      }
    }
  }

  if (overlayWindow) {
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
        parent: overlayWindow,
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
    if (overlayWindow) {
      const opacity = overlayWindow.getOpacity();
      if (opacity < 0.8) {
        overlayWindow.setOpacity(opacity + 0.02);
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

// eslint-disable-next-line import/prefer-default-export
export const setupTimeoutById = (id: number) => {
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
