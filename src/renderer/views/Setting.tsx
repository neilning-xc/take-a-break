/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import '../style/App.global.scss';

const { ipcRenderer } = window.electron;

const Setting = () => {
  const [workTime, updateWorkTime] = useState<number>(0);
  const [breakTime, updateBreakTime] = useState<number>(0);
  const [delayTime, updateDelayTime] = useState<number>(0);

  const handleSaveClick = () => {
    ipcRenderer.saveConfig({ workTime, breakTime, delayTime });
  };

  useEffect(() => {
    const schedules = ipcRenderer.getSchedules();
    const schedule = schedules[0];
    updateWorkTime(schedule.workTime);
    updateBreakTime(schedule.breakTime);
    updateDelayTime(schedule.delayTime);
  }, []);

  return (
    <div className="setting">
      <form className="form">
        <div className="row">
          <label>工作时间</label>
          <div className="field">
            <input
              name="work-time"
              value={workTime}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                updateWorkTime(Number(event.target.value))
              }
              type="text"
              placeholder="工作时间"
            />
          </div>
        </div>
        <div className="row">
          <label>休息时间</label>
          <div className="field">
            <input
              name="break-time"
              value={breakTime}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                updateBreakTime(Number(event.target.value))
              }
              type="text"
              placeholder="休息时间"
            />
          </div>
        </div>
        <div className="row">
          <label>推迟时间</label>
          <div className="field">
            <input
              name="delay-time"
              value={delayTime}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                updateDelayTime(Number(event.target.value))
              }
              type="text"
              placeholder="推迟时间"
            />
          </div>
        </div>
        <div className="row">
          <button
            className="neu-button"
            type="button"
            onClick={handleSaveClick}
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
};

export default Setting;
