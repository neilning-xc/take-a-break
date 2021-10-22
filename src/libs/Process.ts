/* eslint-disable import/prefer-default-export */
import ps from 'ps-node';

export const getProcess = (processName: string): Promise<ps.Program[]> => {
  return new Promise((resolve, reject) => {
    ps.lookup(
      { command: processName },
      (err: Error, processList: ps.Program[]) => {
        if (!err) {
          resolve(processList);
        }
        reject(err);
      }
    );
  });
};

export const checkProcessList = (processList: string[]): Promise<boolean> => {
  const promiseList = processList.map((proceName) => getProcess(proceName));
  return Promise.race(promiseList).then(
    () => {
      return true;
    },
    () => {
      return false;
    }
  );
};

const pausedProcess = [
  '/Applications/WeChat.app/Contents/MacOS/WeChat',
  '/System/Applications/QuickTime Player.app/Contents/MacOS/QuickTime Player',
  '/System/Applications/FaceTime.app/Contents/MacOS/FaceTime',
];

export const checkSpecificProcess = () => {
  return checkProcessList(pausedProcess);
};
