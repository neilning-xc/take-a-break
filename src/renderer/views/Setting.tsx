/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import '../style/App.global.scss';
import classNames from 'classnames';
import { Button, Divider, Menu } from 'antd';
import { SettingOutlined, PlusCircleOutlined } from '@ant-design/icons';
import ScheduleForm from '../components/ScheduleForm';
import MenuItem from '../components/MenuItem';
import Exclude from './Exclude';
import Preference from './Preference';

const { ipcRenderer } = electron;

const getEmpty: () => Schedule = () => {
  return {
    id: 0,
    name: '休息计划',
    message: '工作这么久了，请休息一下☕️',
    workTime: 3600,
    breakTime: 180,
    delayTime: 300,
  };
};

const Setting: React.FunctionComponent = () => {
  const [currentId, updateCurrentId] = useState<number>(0);
  const [schedules, updateSchedules] = useState<Schedule[]>([]);
  const [currentRow, updateCurrent] = useState<Schedule>(getEmpty());

  const handleMenuClick = (schedule: Schedule) => {
    updateCurrent(schedule);
  };

  useEffect(() => {
    const data = ipcRenderer.getSchedules();
    updateSchedules(data);
  }, []);

  useEffect(() => {
    const id = ipcRenderer.getCurrentId();
    updateCurrentId(id);
  }, []);

  /**
   * 订阅所有schedules更新
   */
  useEffect(() => {
    ipcRenderer.on('updateSchedules', (args: Schedule[]) => {
      updateSchedules(args);
    });

    return () => {
      ipcRenderer.removeAllListeners('updateSchedules');
    };
  }, []);

  /**
   * 订阅当前正在运行的schedule的id更新事件
   */
  useEffect(() => {
    ipcRenderer.on('updateCurrentId', (id: number) => {
      updateCurrentId(id);
    });

    return () => {
      ipcRenderer.removeAllListeners('updateCurrentId');
    };
  }, []);

  return (
    <div className="setting">
      <div className="left-menu">
        <div className="title">
          <h3 className="label">预约计划</h3>
          <Link to="/setting/add-schedule">
            <Button
              type="primary"
              size="small"
              ghost
              icon={<PlusCircleOutlined />}
            >
              添加
            </Button>
          </Link>
        </div>

        <ul>
          {schedules.map((schedule: Schedule) => {
            return (
              <li
                className={classNames({
                  avtive: schedule.id === currentRow.id,
                })}
                key={schedule.id}
                onClick={() => handleMenuClick(schedule)}
              >
                <Link to={`/setting/${schedule.id}`}>
                  <MenuItem
                    key={schedule.id}
                    data={schedule}
                    currentId={currentId}
                  />
                </Link>
                <Divider style={{ margin: 5 }} />
              </li>
            );
          })}
        </ul>
        <Menu mode="inline" className="custom-menu">
          {/* <Menu.Item key="exclude" icon={<CloseCircleOutlined />}>
            <Link to="/setting/exclude">例外程序</Link>
          </Menu.Item> */}
          <Menu.Item key="preference" icon={<SettingOutlined />}>
            <Link to="/setting/preference">设置</Link>
          </Menu.Item>
        </Menu>
      </div>

      <div className="content">
        <Switch>
          <Route path="/setting/preference">
            <Preference />
          </Route>
          <Route path="/setting/exclude">
            <Exclude />
          </Route>
          <Route path="/setting/add-schedule">
            <ScheduleForm data={getEmpty()} />
          </Route>
          <Route path="/setting/:id">
            <ScheduleForm data={currentRow} />
          </Route>
        </Switch>
      </div>
    </div>
  );
};

export default Setting;
