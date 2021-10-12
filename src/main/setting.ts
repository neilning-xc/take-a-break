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
import { BrowserWindow, ipcMain, IpcMainEvent, dialog } from 'electron';
import DB from '../libs/DB';
import ReactBrowserWindow from '../libs/ReactBrowserWindow';

let settingWindow: BrowserWindow | null = null;

ipcMain.on('updateConfig', (_: IpcMainEvent, args: Schedule) => {
  try {
    DB().table('schedule').update(args);
    dialog.showMessageBox(settingWindow as BrowserWindow, {
      message: '更新成功',
    });
    const records = DB().table('schedule').findAll();
    settingWindow?.webContents.send('updateSchedules', records);
  } catch {
    dialog.showErrorBox('结果', '更新失败');
  }
});

ipcMain.on('removeConfig', (_: IpcMainEvent, id: number) => {
  try {
    DB().table('schedule').delete(id);
    dialog.showMessageBox(settingWindow as BrowserWindow, {
      message: '删除成功',
    });
    const records = DB().table('schedule').findAll();
    settingWindow?.webContents.send('updateSchedules', records);
  } catch {
    dialog.showErrorBox('结果', '删除失败');
  }
});

ipcMain.on('getSchedules', (event: IpcMainEvent) => {
  const schedules = DB().table('schedule').findAll();
  event.returnValue = schedules;
});

const createSettingWindow = async () => {
  if (settingWindow !== null) {
    settingWindow?.show();
    settingWindow?.focus();
    return;
  }
  const reactBrowserWindow = ReactBrowserWindow.CreateWindow({
    width: 2560,
    height: 1600,
    pathname: '#/setting',
  });

  settingWindow = reactBrowserWindow.browserWindow;
  settingWindow?.webContents.on('did-finish-load', () => {
    if (!settingWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    settingWindow?.show();
    settingWindow?.focus();

    settingWindow?.webContents.send('setting');
  });
  settingWindow?.on('closed', () => {
    settingWindow = null;
  });
};

export default createSettingWindow;
