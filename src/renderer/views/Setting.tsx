/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import '../style/App.global.scss';
import classNames from 'classnames';
import SetForm from '../components/SetForm';
import MenuItem from '../components/MenuItem';

const { ipcRenderer } = electron;

const emptyRow: Schedule = {
  id: 0,
  workTime: 0,
  breakTime: 0,
  delayTime: 0,
};

const Setting: React.FunctionComponent = () => {
  const [currentId, updateCurrentId] = useState<number>(0);
  const [schedules, updateSchedules] = useState<Schedule[]>([]);
  const [currentRow, updateCurrent] = useState<Schedule>(emptyRow);

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
          <button>
            <Link to="/setting/add-setting">添加</Link>
          </button>
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
                  <MenuItem data={schedule} currentId={currentId} />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="content">
        <Switch>
          <Route path="/setting/add-setting">
            <SetForm data={emptyRow} />
          </Route>
          <Route path="/setting/:id">
            <SetForm data={currentRow} />
          </Route>
        </Switch>
      </div>
    </div>
  );
};

export default Setting;
