/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { Schedule } from 'global';
import React, { useState, useEffect } from 'react';
import '../style/App.global.scss';
import classNames from 'classnames';
import SetForm from '../components/SetForm';
import MenuItem from '../components/MenuItem';

const { ipcRenderer } = window.electron;

const Setting: React.FunctionComponent = () => {
  const [schedules, updateSchedules] = useState<Schedule[]>([]);
  const [currentRow, updateCurrent] = useState<Schedule>({
    workTime: 0,
    breakTime: 0,
    delayTime: 0,
  });

  const handleMenuClick = (schedule: Schedule) => {
    updateCurrent(schedule);
  };

  useEffect(() => {
    const data = ipcRenderer.getSchedules();
    updateSchedules(data);
  }, []);

  useEffect(() => {
    ipcRenderer.on('updateSchedules', (args: Schedule[]) => {
      updateSchedules(args);
    });

    return () => {
      ipcRenderer.removeAllListeners('updateSchedules');
    };
  }, []);

  return (
    <div className="setting">
      <div className="left-menu">
        <h3 className="label">预约计划</h3>
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
                <MenuItem data={schedule} />
              </li>
            );
          })}
        </ul>
      </div>
      <div className="content">
        <SetForm data={currentRow} />
      </div>
    </div>
  );
};

export default Setting;
