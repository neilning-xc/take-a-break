import '@testing-library/jest-dom';
import { advanceBy, clear } from 'jest-date-mock';

import ScheduleTimer from '../libs/ScheduleTimer';

jest.mock('electron', () => {
  return {
    app: {
      isPackaged: false,
    },
  };
});

let scheduleTimer: ScheduleTimer;
beforeEach(() => {
  scheduleTimer = ScheduleTimer.getInstance();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ScheduleTimer', () => {
  it('getInstance should return single instance', () => {
    const scheduleTimer1 = ScheduleTimer.getInstance();

    expect(scheduleTimer).toEqual(scheduleTimer1);
  });

  it('ScheduleTimer emit countdown', () => {
    jest.useFakeTimers();
    const schedule = { workTime: 1000, breakTime: 20, delayTime: 30 };
    const callback = jest.fn();
    scheduleTimer.on('countdown', callback);
    scheduleTimer.start(schedule);
    jest.advanceTimersByTime(3000);
    expect(callback).toBeCalledTimes(3);
    scheduleTimer.disable();
  });

  it('ScheduleTimer emit break', () => {
    jest.useFakeTimers();
    const schedule = { workTime: 10, breakTime: 20, delayTime: 30 };
    const callback = jest.fn();
    scheduleTimer.on('break', callback);
    scheduleTimer.start(schedule);
    for (let index = 0; index < 10; index++) {
      advanceBy(1000); // 时钟快进一秒，但此时setInterval中的回调函数并不会执行
      jest.advanceTimersByTime(1000); // 使setInterval的时钟快进1000ms，此时setInterval中的callback才会执行
    }
    expect(callback).toBeCalledTimes(1);
    scheduleTimer.disable();
    clear();
  });
});
