import React, { useEffect, useState } from 'react';
import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { ipcRenderer } = electron;

const Preference: React.FunctionComponent = () => {
  const [preference, setPreference] = useState<IPreference>({
    skipScreenSaver: true,
    skipScreenLock: true,
    skipDoNotDisturb: false,
  });

  useEffect(() => {
    const data = ipcRenderer.getPreference();
    setPreference(data);
  }, []);

  const handleCheckboxChange = (key: string, value: boolean) => {
    const data = { ...preference };
    data[key] = value;
    setPreference(data);
  };

  return (
    <div>
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
      <div>
        <Checkbox
          onChange={(event: CheckboxChangeEvent) =>
            handleCheckboxChange('skipScreenSaver', event.target.checked)
          }
          checked={preference.skipScreenSaver}
        >
          屏幕保护程序启动时跳过
        </Checkbox>
      </div>
      <div>
        <Checkbox
          onChange={(event: CheckboxChangeEvent) =>
            handleCheckboxChange('skipDoNotDisturb', event.target.checked)
          }
          checked={preference.skipDoNotDisturb}
        >
          勿扰模式打开时跳过
        </Checkbox>
      </div>
    </div>
  );
};

export default Preference;
