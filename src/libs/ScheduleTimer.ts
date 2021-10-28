import EventEmitter from 'events';
import { getTimestamp } from '../main/util';
import { STATUS } from '../constants';

type Timer = NodeJS.Timeout | null;

class ScheduleTimer extends EventEmitter {
  public globalTimer: Timer = null;

  public globalStatus: STATUS;

  public startTime = 0; // 记录点击开始按钮时的时间

  public pausedTime = 0; // 记录点击暂停按钮时的时间

  private constructor() {
    super();
    this.globalStatus = STATUS.closed;
  }

  public start(params: Pick<Schedule, 'workTime' | 'breakTime' | 'delayTime'>) {
    const { workTime, breakTime, delayTime } = params;
    if (this.globalTimer === null) {
      this.startTime = getTimestamp();
      this.globalStatus = STATUS.working;
      this.globalTimer = setInterval(() => {
        const currentTime = getTimestamp();
        let timeLeft = 0;

        // 处理工作状态倒计时
        if (this.globalStatus === STATUS.working) {
          timeLeft = workTime - (currentTime - this.startTime);
          if (currentTime - this.startTime >= workTime) {
            // 工作时间结束，开始休息
            this.startTime = currentTime;
            this.globalStatus = STATUS.breaking;

            this.emit('break', this.globalStatus);
          }
        }

        // 处理休息状态的倒计时，休息结束时转换为工作状态
        if (this.globalStatus === STATUS.breaking) {
          timeLeft = breakTime - (currentTime - this.startTime);
          if (currentTime - this.startTime >= breakTime) {
            // 休息结束，开始工作
            this.startTime = currentTime;
            this.globalStatus = STATUS.working;
            this.emit('working', this.globalStatus);
          }
        }

        // 处理推迟状态下的倒计时，推迟结束时，转换为休息状态
        if (this.globalStatus === STATUS.delaying) {
          timeLeft = delayTime - (currentTime - this.startTime);
          if (currentTime - this.startTime >= delayTime) {
            // 工作时间结束，开始休息
            this.startTime = currentTime;
            this.globalStatus = STATUS.breaking;
            this.emit('break');
          }
        }

        if (this.globalStatus === STATUS.paused) {
          timeLeft = workTime - (this.pausedTime - this.startTime);
        }

        this.emit('countdown', timeLeft);
      }, 1000);
    }
  }

  public pause() {
    if (this.globalStatus === STATUS.working) {
      this.globalStatus = STATUS.paused;
      this.pausedTime = getTimestamp();
    }
  }

  public resume() {
    if (this.globalStatus === STATUS.paused) {
      this.globalStatus = STATUS.working;
      const currentTime = getTimestamp();
      // 设置新的开始时间，以便恢复工作状态时，能够重新得到暂停前的剩余时间
      this.startTime += currentTime - this.pausedTime;
    }
  }

  public skip() {
    if (this.globalStatus === STATUS.breaking) {
      this.globalStatus = STATUS.working;
      this.startTime = getTimestamp();
    }
  }

  public postpone() {
    if (this.globalStatus === STATUS.breaking) {
      this.globalStatus = STATUS.delaying;
      this.startTime = getTimestamp();
    }
  }

  public disable() {
    if (this.globalTimer) {
      clearInterval(this.globalTimer);
      this.globalTimer = null;
    }
  }

  static instance: ScheduleTimer | null = null;

  /**
   * 目前支持单个schedule，所以使用单例模式保证全局拿到的是同一个timer对象
   * @param scheduleTimer
   * @returns
   */
  static getInstance() {
    if (ScheduleTimer.instance === null) {
      ScheduleTimer.instance = new ScheduleTimer();
    }
    return ScheduleTimer.instance;
  }
}

export default ScheduleTimer;
