/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import '../style/App.global.scss';
import config from '../../config.json';

const { ipcRenderer } = window.electron;

const Setting = () => {
  const [workTime, updateWorkTime] = useState<number>(config.workTime);
  const [breakTime, updateBreakTime] = useState<number>(config.breakTime);
  const [delayTime, updateDelayTime] = useState<number>(config.delayTime);

  const handleSaveClick = () => {
    ipcRenderer.saveConfig({ workTime, breakTime, delayTime });
  };

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
