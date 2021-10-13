/* eslint-disable react/prop-types */
import React from 'react';

const { ipcRenderer } = electron;
interface ItemProp {
  data: Schedule;
  currentId: number;
}

const MenuItem: React.FunctionComponent<ItemProp> = ({ data, currentId }) => {
  const handleRemoveClick = () => {
    ipcRenderer.removeConfig(data.id);
  };

  const handleDisableClick = () => {
    ipcRenderer.disableSchedule();
  };

  const handleStartClick = () => {
    ipcRenderer.startSchedule(data.id);
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
      </div>
    </div>
  );
};

export default MenuItem;
