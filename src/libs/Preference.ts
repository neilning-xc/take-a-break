import { powerMonitor } from 'electron';
import Store from 'electron-store';
import EventEmitter from 'events';
import { PREFERENCE } from '../constants';
import ScheduleTimer from './ScheduleTimer';

const store = new Store();
if (!store.has(PREFERENCE)) {
  store.set(PREFERENCE, {
    skipScreenSaver: true,
    skipScreenLock: true,
    skipDoNotDisturb: false,
  });
}
const preference = <IPreference>store.get(PREFERENCE);

class Preference extends EventEmitter {
  public scheduleTimer: ScheduleTimer;

  constructor(scheduleTimer: ScheduleTimer) {
    super();
    this.scheduleTimer = scheduleTimer;
  }

  public init() {
    this.initListers();
  }

  private initListers() {
    this.on('updatePreference', this.updatePreference);
  }

  private pauseSchedule() {
    this.scheduleTimer.pause();
  }

  private resumeSchedule() {
    this.scheduleTimer.pause();
  }

  private updatePreference() {
    if (preference.skipScreenLock) {
      powerMonitor.addListener('lock-screen', this.pauseSchedule);
      powerMonitor.addListener('unlock-screen', this.resumeSchedule);
    } else {
      powerMonitor.removeListener('lock-screen', this.pauseSchedule);
      powerMonitor.removeListener('unlock-screen', this.resumeSchedule);
    }
  }
}

export default Preference;
