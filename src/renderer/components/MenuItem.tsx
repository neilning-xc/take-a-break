/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Menu } from 'antd';
import {
  ClockCircleOutlined,
  PlayCircleFilled,
  SettingFilled,
  DeleteFilled,
  PauseCircleFilled,
  CheckCircleFilled,
  StopFilled,
  ClockCircleFilled,
} from '@ant-design/icons';
import { STATUS } from '../../constants';
import { formatTime } from '../views/util';

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

  const handleBreakClick = () => {
    ipcRenderer.break();
    const status = ipcRenderer.getStatus();
    setStatus(status);
  };

  const handleMenuClick = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const menu = (
    <Menu>
      {currentId === data.id && (
        <Menu.Item
          key={1}
          icon={<ClockCircleFilled />}
          onClick={handleBreakClick}
        >
          休息
        </Menu.Item>
      )}

      {currentId !== data.id && (
        <Menu.Item key={2} icon={<DeleteFilled />} onClick={handleRemoveClick}>
          删除
        </Menu.Item>
      )}

      {globalStatus === STATUS.paused && (
        <Menu.Item
          key={3}
          icon={<CheckCircleFilled />}
          onClick={handleResumeClick}
        >
          恢复
        </Menu.Item>
      )}
      {globalStatus === STATUS.working && currentId === data.id && (
        <Menu.Item
          key={4}
          icon={<PauseCircleFilled />}
          onClick={handlePauseClick}
        >
          暂停
        </Menu.Item>
      )}
    </Menu>
  );

  const color = currentId === data.id ? '#108ee9' : '#989898';

  return (
    <div className="menu-item">
      <ClockCircleOutlined
        spin={currentId === data.id}
        style={{ color, marginTop: 4 }}
      />
      <div className="schedule-info">
        <h4 style={{ color }}>{data.name ? data.name : '名称'}</h4>
        <div>
          <label>休息时间：</label>
          <strong>{formatTime(data.breakTime)}</strong>
        </div>
        <div>
          <label>工作时间：</label>
          <strong>{formatTime(data.workTime)}</strong>
        </div>
        <div>
          <label>推迟时间：</label>
          <strong>{formatTime(data.delayTime)}</strong>
        </div>
      </div>
      <div className="action" onClick={handleMenuClick}>
        {currentId === data.id ? (
          <Button
            size="small"
            type="link"
            icon={<StopFilled />}
            onClick={handleDisableClick}
          >
            禁用
          </Button>
        ) : (
          <Button
            size="small"
            type="link"
            icon={<PlayCircleFilled />}
            onClick={handleStartClick}
          >
            开始
          </Button>
        )}
        <Dropdown overlay={menu} placement="bottomLeft" arrow>
          <Button size="small" type="link" icon={<SettingFilled />}>
            其他
          </Button>
        </Dropdown>
      </div>
    </div>
  );
};

export default MenuItem;
