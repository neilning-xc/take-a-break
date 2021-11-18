/* eslint-disable no-restricted-syntax */
/* eslint-disable promise/always-return */
/* eslint global-require: off, no-console: off */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { app, BrowserWindow, Menu, Tray } from 'electron';
import * as Preference from '../libs/Preference';
import { getAssetPath } from './util';
import { formatTime } from '../renderer/views/util';
import { CURRENT_ID } from '../constants';
import createSettingWindow from './setting';
import { setupTimeoutById } from './overlay';
import DB from '../libs/DB';
import ScheduleTimer from '../libs/ScheduleTimer';
import store from '../libs/ElectronStore';
import AppUpdater from '../libs/AppUpdater';
import pkg from '../../package.json';

// 获取schedule线程实例
const scheduleTimer = ScheduleTimer.getInstance();

// 初始化用户配置
Preference.init();

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

let tray: Tray | null = null;
let settingWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}
if (isDevelopment) {
  require('electron-debug')();
}

scheduleTimer.on('countdown', (timeLeft: number) => {
  tray?.setTitle(formatTime(timeLeft));
});

const handleSettingClick = () => {
  createSettingWindow();
};

const handleQuitClick = () => {
  app.quit();
};

const init = async () => {
  if (process.platform === 'darwin') {
    app.dock.setIcon(getAssetPath('icon.png'));
  }
  // settingWindow = await createSettingWindow();
  const count = DB('schedule').count();
  if (count > 0) {
    if (store.has(CURRENT_ID) && store.get(CURRENT_ID) !== 0) {
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
  } else if (process.env.NODE_ENV === 'production') {
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

    // eslint-disable-next-line no-new
    new AppUpdater();
  })
  .catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (settingWindow === null || settingWindow.isDestroyed()) {
    settingWindow = createSettingWindow();
  } else {
    settingWindow.show();
    settingWindow.focus();
  }
});

// TODO 使用默认的about面板，未来可以使用https://www.npmjs.com/package/electron-about 替换
app.setAboutPanelOptions({
  applicationName: pkg.productName,
  applicationVersion: pkg.version,
  copyright: `MIT © ${pkg.productName}`,
  authors: ['Neil Ning: ningcorder@foxmail.com'],
  website: 'https://github.com/neilning-xc/take-a-break/releases',
  iconPath: getAssetPath('icons/64x64.png'), // It doesn't work on MacOS
});
