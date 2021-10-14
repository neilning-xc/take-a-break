const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    updateConfig(data) {
      ipcRenderer.send('updateConfig', data);
    },
    addConfig(data) {
      ipcRenderer.send('addConfig', data);
    },
    removeConfig(id) {
      ipcRenderer.send('removeConfig', id);
    },
    pauseSchedule() {
      ipcRenderer.send('pauseSchedule');
    },
    resumeSchedule() {
      ipcRenderer.send('resumeSchedule');
    },
    skipSchedule() {
      ipcRenderer.send('skipSchedule');
    },
    postponeSchedule() {
      ipcRenderer.send('postponeSchedule');
    },
    disableSchedule() {
      ipcRenderer.send('disableSchedule');
    },
    startSchedule(id) {
      ipcRenderer.send('startSchedule', id);
    },
    getSchedules() {
      return ipcRenderer.sendSync('getSchedules');
    },
    getCurrentId() {
      return ipcRenderer.sendSync('getCurrentId');
    },
    getStatus() {
      return ipcRenderer.sendSync('getStatus');
    },
    on(channel, func) {
      const validChannels = [
        'countdown',
        'status',
        'updateSchedules',
        'updateCurrentId',
      ];
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
