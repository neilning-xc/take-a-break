import { BrowserWindow, shell, Menu } from 'electron';
import { BrowserWindowConstructorOptions } from 'electron/main';
import path from 'path';
import { EventEmitter } from 'stream';
import MenuBuilder from '../main/menu';
import { getAssetPath, installExtensions, resolveHtmlPath } from '../main/util';

// 实现类似于

export default class ReactBrowserWindow extends EventEmitter {
  public browserWindow: BrowserWindow | null = null;

  public option: ReactBrowserWindowOption = {};

  public pathname = '';

  // 静态属性用于保存所有创建的窗口实利
  // TODO: 后续优化：设置最大数组长度，避免保存过多对象，导致性能问题
  static windowsManager: BrowserWindow[] = [];

  constructor(option: ReactBrowserWindowOption) {
    super();

    if (option.pathname) {
      this.pathname = option.pathname as string;
    }
    this.option = option;

    this.browserWindow = this.createWindow();

    ReactBrowserWindow.windowsManager.push(this.browserWindow);

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

  /**
   * 同时向所有已经创建的窗口实例发送数据
   * @param channel
   * @param args
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static send(channel: string, ...args: any[]) {
    ReactBrowserWindow.windowsManager.forEach((window: BrowserWindow) => {
      if (!window.isDestroyed()) {
        window?.webContents.send(channel, ...args);
      }
    });
  }
}
