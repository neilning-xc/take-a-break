import { STATUS } from './src/constants';

Object.defineProperty(window, 'electron', {
  value: {
    ipcRenderer: {
      on: jest.fn(),
      removeAllListeners: jest.fn(),
      getPreference: jest.fn(() => {
        return {
          skipScreenSaver: true,
          skipScreenLock: true,
          loginStart: true,
        };
      }),
      getExcludes: jest.fn(() => {
        return [];
      }),
      getSchedules: jest.fn(() => {
        return [];
      }),
      getCurrentId: jest.fn(() => {
        return 0;
      }),
      addConfig: jest.fn((data) => {
        return data;
      }),
      updateConfig: jest.fn(),
      getStatus: jest.fn(() => STATUS.working),
    },
  },
});

// ant jest
Object.defineProperty(global.window, 'matchMedia', {
  value: jest.fn((query) => ({
    matches: query.includes('max-width'),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
});
