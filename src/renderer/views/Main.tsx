import React, { useState, useEffect } from 'react';
import { STATUS } from '../../constants';
import '../style/App.global.scss';
import { formatTime } from './util';

const { ipcRenderer } = electron;

const Main = () => {
  const [countdown, updateCountdown] = useState(0);
  const [status, updateStatus] = useState(STATUS.closed);

  useEffect(() => {
    if (status === STATUS.breaking) {
      document.title = '请休息一下☕️';
    } else if (status === STATUS.working) {
      document.title = '工作中......✏️';
    }
  });

  useEffect(() => {
    ipcRenderer.on('countdown', (args: unknown) => {
      updateCountdown(args as number);
    });

    return () => {
      ipcRenderer.removeAllListeners('countdown');
    };
  }, []);

  useEffect(() => {
    ipcRenderer.on('status', (args: unknown) => {
      updateStatus(args as number);
    });

    return () => {
      ipcRenderer.removeAllListeners('status');
    };
  }, []);

  const handleSkipClick = () => {
    ipcRenderer.skipSchedule();
  };
  const handlePostponeClick = () => {
    ipcRenderer.postponeSchedule();
  };

  return (
    <div className="container">
      <div className="neu">
        <h3>{formatTime(countdown)}</h3>
      </div>
      <div className="toolbar">
        <button type="button" className="neu-button" onClick={handleSkipClick}>
          跳过
        </button>
        <button
          type="button"
          className="neu-button"
          onClick={handlePostponeClick}
        >
          推迟
        </button>
      </div>
    </div>
  );
};

export default Main;
