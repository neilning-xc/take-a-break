import { BrowserWindow, shell } from 'electron';
import { BrowserWindowConstructorOptions } from 'electron/main';
import path from 'path';
import { EventEmitter } from 'stream';
import MenuBuilder from '../main/menu';
import { getAssetPath, installExtensions, resolveHtmlPath } from '../main/util';

export default class ReactBrowserWindow extends EventEmitter {
  public browserWindow: BrowserWindow | null = null;

  public option: ReactBrowserWindowOption = {};

  public pathname = '';

  constructor(option: ReactBrowserWindowOption) {
    super();

    if (option.pathname) {
      this.pathname = option.pathname as string;
    }
    this.option = option;

    this.browserWindow = this.createWindow();

    this.installExtensions();
  }

  public createWindow() {
    const defaultOption: BrowserWindowConstructorOptions = {
      show: false,
      width: 1024,
      height: 728,
      icon: getAssetPath('icon.png'),
      webPreferences: {
        preload: path.join(__dirname, '../main/preload.js'),
      },
    };

    const fullOption: ReactBrowserWindowOption = {
      ...defaultOption,
      ...this.option,
    };

    const browserWindow = new BrowserWindow(fullOption);

    browserWindow.loadURL(
      resolveHtmlPath(
        this.option.template ? this.option.template : 'index.html'
      ) + this.pathname
    );

    const menuBuilder = new MenuBuilder(browserWindow);
    menuBuilder.buildMenu();

    // Open urls in the user's browser
    browserWindow.webContents.on('new-window', (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });

    return browserWindow;
  }

  // eslint-disable-next-line class-methods-use-this
  async installExtensions() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      await installExtensions();
    }
  }

  static CreateWindow(option: ReactBrowserWindowOption = {}) {
    return new ReactBrowserWindow(option);
  }
}
