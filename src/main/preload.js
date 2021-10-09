const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    saveConfig(data) {
      ipcRenderer.send('saveConfig', data);
    },
    skipBreak() {
      ipcRenderer.send('skipBreak');
    },
    postponeBreak() {
      ipcRenderer.send('postponeBreak');
    },
    getSchedules() {
      return ipcRenderer.sendSync('getSchedules');
    },

    on(channel, func) {
      const validChannels = ['countdown', 'status'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = [];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
    removeAllListeners(channel) {
      ipcRenderer.removeAllListeners(channel);
    },
  },
});
