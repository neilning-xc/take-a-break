/* eslint-disable @typescript-eslint/naming-convention */
export enum STATUS {
  closed,
  working,
  breaking,
  delaying,
  paused,
}

export const CURRENT_ID = 'currentId';
export const PREFERENCE = 'preference';
export const EXCLUDES = 'excludes';

export enum PROCESS_STAT {
  OPEN,
  FOREGROUND,
}
