import { powerMonitor } from 'electron';
import Store from 'electron-store';
import { PREFERENCE, STATUS } from '../constants';
import ScheduleTimer from './ScheduleTimer';

const store = new Store();
if (!store.has(PREFERENCE)) {
  store.set(PREFERENCE, {
    skipScreenSaver: true,
    skipScreenLock: true,
    skipDoNotDisturb: false,
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

export function listenScreenLock() {
  powerMonitor.addListener('lock-screen', pauseSchedule);
  powerMonitor.addListener('unlock-screen', resumeSchedule);
}
