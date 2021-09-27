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
import { BrowserWindow, Config, ipcMain, IpcMainEvent } from 'electron';
import ReactBrowserWindow from '../libs/ReactBrowserWindow';

let settingWindow: BrowserWindow | null = null;

ipcMain.on('save-config', (_: IpcMainEvent, args: Config) => {
  console.log(args);
});

const createSettingWindow = async () => {
  if (settingWindow !== null) {
    return;
  }
  const reactBrowserWindow = ReactBrowserWindow.CreateWindow({
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
