Object.defineProperty(window, 'electron', {
  value: {
    ipcRenderer: {
      on: jest.fn(),
      removeAllListeners: jest.fn(),
    },
  },
});
