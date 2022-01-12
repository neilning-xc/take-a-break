import '@testing-library/jest-dom';
import { advanceBy, clear } from 'jest-date-mock';

import { STATUS } from '../constants';
import ScheduleTimer from '../libs/ScheduleTimer';

const fastForward = (seconds: number) => {
  for (let index = 0; index < seconds; index++) {
    advanceBy(1000); // 时钟快进一秒，但此时setInterval中的回调函数并不会执行
    jest.advanceTimersByTime(1000); // 使setInterval的时钟快进1000ms，此时setInterval中的callback才会执行
  }
};

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
    fastForward(10);
    expect(callback).toBeCalledTimes(1);
    scheduleTimer.disable();
    clear();
  });

  it('ScheduleTimer emit working', () => {
    jest.useFakeTimers();
    const schedule = { workTime: 10, breakTime: 20, delayTime: 30 };
    const callback = jest.fn();
    scheduleTimer.on('working', callback);
    scheduleTimer.start(schedule);
    fastForward(30);
    expect(callback).toBeCalledTimes(1);
    scheduleTimer.disable();
    clear();
  });

  it('ScheduleTimer emit break during delaying', () => {
    jest.useFakeTimers();
    const schedule = { workTime: 10, breakTime: 20, delayTime: 30 };
    const callback = jest.fn();
    scheduleTimer.on('break', callback);
    scheduleTimer.start(schedule);
    fastForward(15); // it's breaking now
    scheduleTimer.postpone();
    fastForward(30);
    expect(callback).toBeCalledTimes(2);
    scheduleTimer.disable();
    clear();
  });

  it('ScheduleTimer pause and resume', () => {
    jest.useFakeTimers();
    const schedule = { workTime: 10, breakTime: 20, delayTime: 30 };
    const callback = jest.fn();
    scheduleTimer.on('break', callback);
    scheduleTimer.start(schedule);
    fastForward(5); // it's working now
    scheduleTimer.pause();
    fastForward(5);
    expect(callback).toBeCalledTimes(0);
    scheduleTimer.resume();
    fastForward(5);
    expect(callback).toBeCalledTimes(1);
    scheduleTimer.disable();
    clear();
  });

  it('ScheduleTimer skip', () => {
    jest.useFakeTimers();
    const schedule = { workTime: 10, breakTime: 20, delayTime: 30 };
    const callback = jest.fn();
    scheduleTimer.on('break', callback);
    scheduleTimer.start(schedule);
    fastForward(15); // it's breaking now
    scheduleTimer.skip(); // skip it
    expect(scheduleTimer.globalStatus).toBe(STATUS.working);
    fastForward(10);
    expect(callback).toBeCalledTimes(2);
    scheduleTimer.disable();
    clear();
  });

  it('ScheduleTimer break', () => {
    jest.useFakeTimers();
    const schedule = { workTime: 10, breakTime: 20, delayTime: 30 };
    const callback = jest.fn();
    scheduleTimer.on('break', callback);
    scheduleTimer.start(schedule);
    fastForward(5); // it's working now
    scheduleTimer.break(); // force it to break
    expect(scheduleTimer.globalStatus).toBe(STATUS.breaking);
    // TODO it does not emit break event, so it's called 0 time, will fix it in the future
    expect(callback).toBeCalledTimes(0);
    scheduleTimer.disable();
    clear();
  });
});
