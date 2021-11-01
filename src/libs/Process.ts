import ps from 'neil-ps-node';

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

const pausedProcess = [
  {
    program: '/Applications/WeChat.app/Contents/MacOS/WeChat',
    stat: 'S',
  },
  {
    program:
      '/System/Applications/QuickTime Player.app/Contents/MacOS/QuickTime Player',
    stat: 'S',
  },
  {
    program: '/System/Applications/FaceTime.app/Contents/MacOS/FaceTime',
    stat: 'S',
  },
];

export const checkSpecificProcess = () => {
  const promiseList = pausedProcess.map((proceName) =>
    getProcess(proceName.program)
  );
  return Promise.race(promiseList).then(
    (processList: ps.Program[]) => {
      let flag = false;
      // eslint-disable-next-line no-restricted-syntax
      for (const process of processList) {
        const matchProgram = pausedProcess.find((item) =>
          process.command.includes(item.program)
        );
        if (matchProgram?.stat === process.stat) {
          flag = true;
          break;
        }
      }
      return flag;
    },
    () => {
      return false;
    }
  );
};

(async () => {
  const flag = await checkSpecificProcess();
  console.log(flag);
})();
