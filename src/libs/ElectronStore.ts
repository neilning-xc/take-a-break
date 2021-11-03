import { app } from 'electron';
import Store from 'electron-store';

const store = new Store({
  cwd: app.getPath('home'),
  name: '.take-a-break',
  fileExtension: '',
});
export default store;
