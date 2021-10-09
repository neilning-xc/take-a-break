import { BrowserWindowConstructorOptions } from 'electron/main';

declare interface Schedule {
  id?: number;
  breakTime: number;
  workTime: number;
  delayTime: number;
  message?: string;
  enable?: boolean;
}

declare interface ReactBrowserWindowOption
  extends BrowserWindowConstructorOptions {
  pathname?: string;
  template?: string;
}
