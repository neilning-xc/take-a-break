/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  dialog,
  app,
  screen,
} from 'electron';
import ReactBrowserWindow from '../libs/ReactBrowserWindow';
import DB from '../libs/DB';
import { CURRENT_ID, EXCLUDES, PREFERENCE, PROCESS_STAT } from '../constants';
import store from '../libs/ElectronStore';
import '../libs/Process';
import { isProd } from './util';

let settingWindow: BrowserWindow | null = null;

const createSettingWindow = () => {
  if (settingWindow !== null) {
    settingWindow?.show();
    settingWindow?.focus();
    return settingWindow;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workArea;
  const reactBrowserWindow = ReactBrowserWindow.CreateWindow({
    width: isProd ? 800 : width,
    height: isProd ? 600 : height,
    pathname: '#/setting/preference',
    fullscreenable: false,
    maximizable: process.env.NODE_ENV !== 'production',
    resizable: process.env.NODE_ENV !== 'production',
  });

  settingWindow = reactBrowserWindow.browserWindow;
  settingWindow?.webContents.on('did-finish-load', () => {
    if (!settingWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    settingWindow?.show();
    settingWindow?.focus();
  });
  settingWindow?.on('closed', () => {
    settingWindow = null;
    // 开发环境时，为了便于调试，不隐藏dock图标
    if (process.env.NODE_ENV === 'production') {
      app.dock.hide();
    }
  });

  settingWindow?.on('show', () => {
    // 开发环境时，为了便于调试，不隐藏dock图标
    if (process.env.NODE_ENV === 'production') {
      app.dock.show();
    }
  });
  return settingWindow;
};

/////////////////////////////////////////
//         异步的主线程监听事件           //
////////////////////////////////////////
ipcMain.on('updateConfig', (_: IpcMainEvent, args: Schedule) => {
  try {
    DB('schedule').update(args);
    dialog.showMessageBox(settingWindow as BrowserWindow, {
      message: '更新成功',
    });
    const records = DB('schedule').findAll();
    ReactBrowserWindow.send('updateSchedules', records);
  } catch {
    dialog.showErrorBox('结果', '更新失败');
  }
});

ipcMain.on('removeConfig', (_: IpcMainEvent, id: number) => {
  try {
    DB('schedule').delete(id);
    dialog.showMessageBox(settingWindow as BrowserWindow, {
      message: '删除成功',
    });
    const records = DB('schedule').findAll();
    ReactBrowserWindow.send('updateSchedules', records);
  } catch {
    dialog.showErrorBox('结果', '删除失败');
  }
});

ipcMain.on('addConfig', (_: IpcMainEvent, schedule: Schedule) => {
  try {
    DB('schedule').insert(schedule);
    dialog.showMessageBox(settingWindow as BrowserWindow, {
      message: '添加成功',
    });
    const records = DB('schedule').findAll();
    ReactBrowserWindow.send('updateSchedules', records);
  } catch {
    dialog.showErrorBox('结果', '添加失败');
  }
});

ipcMain.on('savePreference', (_: IpcMainEvent, preference: IPreference) => {
  store.set(PREFERENCE, preference);
});

ipcMain.on('updateExcludes', (_: IpcMainEvent, excludes: IExclude[]) => {
  store.set(EXCLUDES, excludes);
});

ipcMain.on('openExcludeDialog', async (event) => {
  const file = await dialog.showOpenDialog(<BrowserWindow>settingWindow, {
    properties: ['openFile'],
  });

  if (file?.filePaths.length) {
    const selectedFile = file.filePaths[0];
    const excludes = <IExclude[]>store.get(EXCLUDES);

    const index = excludes.findIndex(
      (exclude: IExclude) => exclude.name === selectedFile
    );
    if (index === -1) {
      excludes.push({
        name: selectedFile,
        status: PROCESS_STAT.FOREGROUND,
      });
      store.set(EXCLUDES, excludes);
      event.sender.send('selectedExcludeFile', file);
    } else {
      dialog.showMessageBox(settingWindow as BrowserWindow, {
        message: '已经添加该程序',
      });
    }
  }
});

/////////////////////////////////////////
//         同步的主线程监听事件           //
////////////////////////////////////////
ipcMain.on('getSchedules', (event: IpcMainEvent) => {
  const schedules = DB('schedule').findAll();
  event.returnValue = schedules;
});

ipcMain.on('getCurrentId', (event: IpcMainEvent) => {
  const currentId = store.get(CURRENT_ID);
  event.returnValue = currentId;
});

ipcMain.on('getPreference', (event: IpcMainEvent) => {
  const preference = store.get(PREFERENCE);
  event.returnValue = preference;
});

ipcMain.on('getExcludes', (event: IpcMainEvent) => {
  const excludes = store.get(EXCLUDES);
  event.returnValue = excludes;
});

export default createSettingWindow;
