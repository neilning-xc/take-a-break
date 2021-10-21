/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import '../style/App.global.scss';
import { Button, Form, Input, InputNumber } from 'antd';

const { ipcRenderer } = electron;

interface SetFormProp {
  data: Schedule;
}

const ScheduleForm: React.FunctionComponent<SetFormProp> = ({ data }) => {
  const [name, updateName] = useState<string>(data.name as string);
  const [message, updateMsg] = useState<string>(data.message as string);
  const [workTime, updateWorkTime] = useState<number>(
    data.workTime / 3600 || 0
  );
  const [breakTime, updateBreakTime] = useState<number>(
    data.breakTime / 60 || 0
  );
  const [delayTime, updateDelayTime] = useState<number>(
    data.delayTime / 60 || 0
  );

  const handleSaveClick = () => {
    const schedule = {
      workTime: workTime * 3600,
      breakTime: breakTime * 60,
      delayTime: delayTime * 60,
      id: data.id,
      name,
      message,
    };
    if (data.id === 0) {
      ipcRenderer.addConfig(schedule);
    } else {
      ipcRenderer.updateConfig(schedule);
    }
  };

  useEffect(() => {
    updateWorkTime(data.workTime);
    updateBreakTime(data.breakTime);
    updateDelayTime(data.delayTime);
  }, [data]);

  return (
    <Form layout="vertical" style={{ width: 350 }}>
      <Form.Item name="name" label="名称">
        <Input
          placeholder="名称"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateName(event.target.value)
          }
          value={name}
        />
      </Form.Item>

      <Form.Item label="工作时间" name="workTime">
        <InputNumber
          min={1}
          style={{ width: '100%' }}
          addonAfter="小时"
          placeholder="设置工作时间（小时）"
          onChange={(value: number) => updateWorkTime(value)}
          value={workTime}
        />
      </Form.Item>
      <Form.Item label="休息时间" name="breakTime">
        <InputNumber
          min={1}
          style={{ width: '100%' }}
          addonAfter="分钟"
          placeholder="设置休息时间（分钟）"
          onChange={(value: number) => updateBreakTime(value)}
          value={breakTime}
        />
      </Form.Item>

      <Form.Item label="推迟时间" name="delayTime">
        <InputNumber
          min={1}
          style={{ width: '100%' }}
          addonAfter="分钟"
          placeholder="设置推迟时间（分钟）"
          onChange={(value: number) => updateDelayTime(value)}
          value={delayTime}
        />
      </Form.Item>

      <Form.Item name="message" label="提示内容">
        <Input
          placeholder="请输入提示内容"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateMsg(event.target.value)
          }
          value={name}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" onClick={handleSaveClick}>
          保存
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ScheduleForm;
