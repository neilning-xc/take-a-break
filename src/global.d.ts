import { BrowserWindowConstructorOptions } from 'electron/main';

declare interface Config {
  breakTime: number;
  workTime: number;
  delayTime: number;
}

declare interface ReactBrowserWindowOption
  extends BrowserWindowConstructorOptions {
  pathname?: string;
  template?: string;
}
