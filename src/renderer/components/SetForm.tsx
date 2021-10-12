/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import '../style/App.global.scss';

const { ipcRenderer } = window.electron;

interface SetFormProp {
  data: Schedule;
}

const SetForm: React.FunctionComponent<SetFormProp> = ({ data }) => {
  const [workTime, updateWorkTime] = useState<number>(data.workTime || 0);
  const [breakTime, updateBreakTime] = useState<number>(data.breakTime || 0);
  const [delayTime, updateDelayTime] = useState<number>(data.delayTime || 0);

  const handleSaveClick = () => {
    ipcRenderer.updateConfig({ workTime, breakTime, delayTime, id: data.id });
  };

  useEffect(() => {
    updateWorkTime(data.workTime);
    updateBreakTime(data.breakTime);
    updateDelayTime(data.delayTime);
  }, [data]);

  return (
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
        <button className="neu-button" type="button" onClick={handleSaveClick}>
          保存
        </button>
      </div>
    </form>
  );
};

export default SetForm;
