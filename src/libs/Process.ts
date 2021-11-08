/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
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
      name: '/System/Applications/QuickTime Player.app',
      status: PROCESS_STAT.FOREGROUND,
    },
    {
      name: '/System/Applications/FaceTime.app',
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
        } else {
          reject(err);
        }
      }
    );
  });
};

// TODO 当前只检查例外程序是否运行，后期添加运行状态：仅打开，或者前台运行时，
export const checkExcludeList = async (
  processList: IExclude[]
): Promise<boolean> => {
  for (const proce of processList) {
    const results = await getProcess(proce.name);
    if (results.length) {
      return true;
    }
  }
  return false;
};

export const checkSpecificProcess = async () => {
  const excludes = <IExclude[]>store.get(EXCLUDES);
  if (!excludes || excludes.length === 0) {
    return false;
  }
  const flag = await checkExcludeList(excludes);
  return flag;
};

/**
 * 每一分钟检查一次例外程序，如果有正在运行的例外程序，则暂停，否则恢复倒计时
 */
scheduleTimer.on('countdown', async () => {
  const { globalStatus, startTime } = scheduleTimer;
  if (globalStatus === STATUS.working || globalStatus === STATUS.paused) {
    const now = getTimestamp();
    if ((now - startTime) % 60 === 0) {
      if (await checkSpecificProcess()) {
        scheduleTimer.pause();
      } else {
        scheduleTimer.resume();
      }
    }
  }
});
