import { app, powerMonitor } from 'electron';
import { PREFERENCE, STATUS } from '../constants';
import ScheduleTimer from './ScheduleTimer';
import store from './ElectronStore';

if (!store.has(PREFERENCE)) {
  store.set(PREFERENCE, {
    skipScreenSaver: true,
    skipScreenLock: true,
    loginStart: true,
  });
}

export function pauseSchedule() {
  const preference = <IPreference>store.get(PREFERENCE);
  if (preference.skipScreenLock) {
    ScheduleTimer.getInstance().pause();
  }
}

export function resumeSchedule() {
  const preference = <IPreference>store.get(PREFERENCE);
  if (
    preference.skipScreenLock &&
    ScheduleTimer.getInstance().globalStatus === STATUS.paused
  ) {
    ScheduleTimer.getInstance().resume();
  }
}

export function setLoginItem() {
  const preference = <IPreference>store.get(PREFERENCE);
  app.setLoginItemSettings({
    openAtLogin: preference.loginStart,
    openAsHidden: true,
  });
}

export function listenScreenLock() {
  powerMonitor.addListener('lock-screen', pauseSchedule);
  powerMonitor.addListener('unlock-screen', resumeSchedule);
}

export function init() {
  listenScreenLock();

  // 如果还没有设置登录时打开
  const setting = app.getLoginItemSettings();
  if (!setting.openAtLogin) {
    setLoginItem();
  }
}
