/* eslint-disable react/prop-types */
import React from 'react';

interface ItemProp {
  data: Schedule;
}

const MenuItem: React.FunctionComponent<ItemProp> = ({ data }) => {
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
        <button>开始</button>
        <button>暂停</button>
        <button>删除</button>
      </div>
    </div>
  );
};

export default MenuItem;
