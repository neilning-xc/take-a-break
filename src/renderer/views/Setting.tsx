/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { Schedule } from 'global';
import React, { useState, useEffect } from 'react';
import '../style/App.global.scss';
import SetForm from '../components/SetForm';

const { ipcRenderer } = window.electron;

interface ItemProp {
  data: Schedule;
}

const Item: React.FunctionComponent<ItemProp> = ({ data }) => {
  return <div className="menu-item">{JSON.stringify(data)}</div>;
};

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
    // const schedule = data[0];
    // updateWorkTime(schedule.workTime);
    // updateBreakTime(schedule.breakTime);
    // updateDelayTime(schedule.delayTime);
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
        <ul>
          {schedules.map((schedule: Schedule) => {
            return (
              <li key={schedule.id} onClick={() => handleMenuClick(schedule)}>
                <Item data={schedule} />
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
