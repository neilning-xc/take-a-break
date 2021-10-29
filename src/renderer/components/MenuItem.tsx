/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Badge, Button, Dropdown, Menu } from 'antd';
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
    event.stopPropagation();
    event.preventDefault();
  };

  const menu = (
    <Menu>
      <Menu.Item icon={<ClockCircleFilled />} onClick={handleBreakClick}>
        休息
      </Menu.Item>

      <Menu.Item icon={<DeleteFilled />} onClick={handleRemoveClick}>
        删除
      </Menu.Item>

      {globalStatus === STATUS.paused && (
        <Menu.Item icon={<CheckCircleFilled />} onClick={handleResumeClick}>
          恢复
        </Menu.Item>
      )}

      {globalStatus === STATUS.working && (
        <Menu.Item icon={<PauseCircleFilled />} onClick={handlePauseClick}>
          暂停
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <div className="menu-item" onClick={handleMenuClick}>
      <Badge
        offset={[0, 4]}
        count={<ClockCircleOutlined style={{ color: '#108ee9' }} />}
      />
      <div className="schedule-info">
        <h4>{data.name ? data.name : '名称'}</h4>
        <div>
          <label>休息时间：</label>
          <strong>{formatTime(data.breakTime)}</strong>
        </div>
        <div>
          <label>工作时间：</label>
          <strong>{formatTime(data.workTime)}</strong>
        </div>
      </div>
      <div className="action">
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
