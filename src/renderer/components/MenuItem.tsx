/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { STATUS } from '../../constants';

const { ipcRenderer } = electron;
interface ItemProp {
  data: Schedule;
  currentId: number;
}

const MenuItem: React.FunctionComponent<ItemProp> = ({ data, currentId }) => {
  const [globalStatus, setStatus] = useState<number>(STATUS.working);

  useEffect(() => {
    const status = ipcRenderer.getStatus();
    setStatus(status);
  }, []);

  const handleRemoveClick = () => {
    ipcRenderer.removeConfig(data.id);
  };

  const handleDisableClick = () => {
    ipcRenderer.disableSchedule();
  };

  const handleStartClick = () => {
    ipcRenderer.startSchedule(data.id);
  };

  const handlePauseClick = () => {
    ipcRenderer.pauseSchedule();
    const status = ipcRenderer.getStatus();
    setStatus(status);
  };

  const handleResumeClick = () => {
    ipcRenderer.resumeSchedule();
    const status = ipcRenderer.getStatus();
    setStatus(status);
  };

  return (
    <div className="menu-item">
      <div className="schedule-info">
        <h4>{data.name ? data.name : '名称'}</h4>
        <div>
          <label>休息时间：</label>
          <strong>{data.breakTime}</strong>
        </div>
        <div>
          <label>工作时间：</label>
          <strong>{data.workTime}</strong>
        </div>
      </div>
      <div className="action">
        {currentId === data.id ? (
          <button onClick={handleDisableClick}>禁用</button>
        ) : (
          <button onClick={handleStartClick}>开始</button>
        )}
        <button onClick={handleRemoveClick}>删除</button>
        {globalStatus === STATUS.paused && (
          <button onClick={handleResumeClick}>恢复</button>
        )}
        {globalStatus === STATUS.working && (
          <button onClick={handlePauseClick}>暂停</button>
        )}
      </div>
    </div>
  );
};

export default MenuItem;
