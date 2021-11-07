/* eslint-disable import/prefer-default-export */
import ps from 'neil-ps-node';
import { EXCLUDES, PROCESS_STAT, STATUS } from '../constants';
import store from './ElectronStore';
import ScheduleTimer from './ScheduleTimer';
import { getTimestamp } from '../main/util';

const scheduleTimer = ScheduleTimer.getInstance();

if (!store.has(EXCLUDES)) {
  store.set(EXCLUDES, [
    {
      name: '/System/Applications/QuickTime Player.app/Contents/MacOS/QuickTime Player',
      status: PROCESS_STAT.FOREGROUND,
    },
    {
      name: '/System/Applications/FaceTime.app/Contents/MacOS/FaceTime',
      status: PROCESS_STAT.FOREGROUND,
    },
  ]);
}

export const getProcess = (processName: string): Promise<ps.Program[]> => {
  return new Promise((resolve, reject) => {
    ps.lookup(
      { command: processName, keywords: ['stat'] },
      (err: Error, processList: ps.Program[]) => {
        if (!err) {
          resolve(processList);
        }
        reject(err);
      }
    );
  });
};

export const checkExcludeList = (processList: IExclude[]): Promise<boolean> => {
  const promiseList = processList.map((proce: IExclude) =>
    getProcess(proce.name)
  );
  return Promise.race(promiseList).then(
    (results: ps.Program[]) => {
      if (results.length) {
        return true;
      }
      return false;
    },
    () => {
      return false;
    }
  );
};

export const checkSpecificProcess = async () => {
  const excludes = <IExclude[]>store.get(EXCLUDES);
  const flag = await checkExcludeList(excludes);
  return flag;
};

scheduleTimer.on('countdown', async () => {
  if (scheduleTimer.globalStatus === STATUS.working) {
    const now = getTimestamp();
    if ((now - scheduleTimer.startTime) / 60 === 0) {
      if (await checkSpecificProcess()) {
        scheduleTimer.pause();
      } else {
        scheduleTimer.resume();
      }
    }
  }
});
