import React, { useEffect, useState } from 'react';
import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { ipcRenderer } = electron;

const Preference: React.FunctionComponent = () => {
  const [preference, setPreference] = useState<IPreference>({
    skipScreenSaver: true,
    skipScreenLock: true,
    loginStart: false,
  });

  useEffect(() => {
    const data = ipcRenderer.getPreference();
    setPreference(data);
  }, []);

  const handleCheckboxChange = (key: keyof IPreference, value: boolean) => {
    const data = { ...preference };
    data[key] = value;
    setPreference(data);
    ipcRenderer.savePreference(data);
  };

  return (
    <div className="preference">
      <div>
        <Checkbox
          onChange={(event: CheckboxChangeEvent) =>
            handleCheckboxChange('skipScreenLock', event.target.checked)
          }
          checked={preference.skipScreenLock}
        >
          锁屏时跳过
        </Checkbox>
      </div>
      {/* <div>
        <Checkbox
          onChange={(event: CheckboxChangeEvent) =>
            handleCheckboxChange('skipScreenSaver', event.target.checked)
          }
          checked={preference.skipScreenSaver}
        >
          屏幕保护程序启动时跳过
        </Checkbox>
      </div> */}
      <div>
        <Checkbox
          onChange={(event: CheckboxChangeEvent) =>
            handleCheckboxChange('loginStart', event.target.checked)
          }
          checked={preference.loginStart}
        >
          开机启动
        </Checkbox>
      </div>
    </div>
  );
};

export default Preference;
