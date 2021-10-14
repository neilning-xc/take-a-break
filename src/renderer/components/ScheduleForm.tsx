/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import '../style/App.global.scss';

const { ipcRenderer } = electron;

interface SetFormProp {
  data: Schedule;
}

const ScheduleForm: React.FunctionComponent<SetFormProp> = ({ data }) => {
  const [name, updateName] = useState<string>(data.name as string);
  const [message, updateMsg] = useState<string>(data.message as string);
  const [workTime, updateWorkTime] = useState<number>(data.workTime || 0);
  const [breakTime, updateBreakTime] = useState<number>(data.breakTime || 0);
  const [delayTime, updateDelayTime] = useState<number>(data.delayTime || 0);

  const handleSaveClick = () => {
    const schedule = {
      workTime,
      breakTime,
      delayTime,
      id: data.id,
      name,
      message,
    };
    if (data.id === 0) {
      ipcRenderer.addConfig(schedule);
    } else {
      ipcRenderer.updateConfig(schedule);
    }
  };

  useEffect(() => {
    updateWorkTime(data.workTime);
    updateBreakTime(data.breakTime);
    updateDelayTime(data.delayTime);
  }, [data]);

  return (
    <form className="form">
      <div className="row">
        <label>名称</label>
        <div className="field">
          <input
            name="name"
            value={name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              updateName(event.target.value)
            }
            type="text"
            placeholder="名称"
          />
        </div>
      </div>
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
        <label>提示内容</label>
        <div className="field">
          <input
            name="message"
            value={message}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              updateMsg(event.target.value)
            }
            type="text"
            placeholder="提示内容"
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

export default ScheduleForm;
