/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="electron"/>

interface Schedule {
  id: number;
  name?: string;
  breakTime: number;
  workTime: number;
  delayTime: number;
  message?: string;
  enable?: boolean;
}

interface ReactBrowserWindowOption
  extends Electron.BrowserWindowConstructorOptions {
  pathname?: string;
  template?: string;
}

interface Window {
  electron?: any;
}

interface IPreference {
  skipScreenSaver: boolean;
  skipScreenLock: boolean;
  loginStart: boolean;
}

declare const electron: any;
