import React, { useEffect, useState } from 'react';
import { Input, Select, Typography } from 'antd';
import '../style/App.global.scss';

const { Option } = Select;
const { Title } = Typography;

const { ipcRenderer } = electron;

const Exclude: React.FunctionComponent = () => {
  const [excludes, setExcludes] = useState<IExclude[]>([]);

  useEffect(() => {
    const data = ipcRenderer.getExcludes();
    setExcludes(data);
  }, []);

  return (
    <div className="exclude">
      <Title level={4}>例外程序</Title>
      {excludes.map((exclude) => {
        return (
          <Input
            key={exclude.name}
            addonAfter={
              <Select defaultValue={exclude.status}>
                <Option value="S">打开时</Option>
                <Option value="Ss">活跃时</Option>
              </Select>
            }
            disabled
            defaultValue={exclude.name}
          />
        );
      })}
    </div>
  );
};

export default Exclude;
