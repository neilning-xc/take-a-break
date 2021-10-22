/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect } from 'react';
import '../style/App.global.scss';
import { Button, Form, Input, InputNumber } from 'antd';

const { ipcRenderer } = electron;

interface SetFormProp {
  data: Schedule;
}

const ScheduleForm: React.FunctionComponent<SetFormProp> = ({ data }) => {
  const [form] = Form.useForm<Schedule>();

  useEffect(() => {
    const { workTime, breakTime, delayTime } = data;

    form.setFieldsValue({
      name: data.name,
      message: data.message,
      workTime:
        process.env.NODE_ENV === 'production' ? workTime / 3600 : workTime,
      breakTime:
        process.env.NODE_ENV === 'production' ? breakTime / 60 : breakTime,
      delayTime:
        process.env.NODE_ENV === 'production' ? delayTime / 60 : delayTime,
    });
  });

  const handleFinish = (formData: Schedule) => {
    const { workTime, breakTime, delayTime } = formData;
    const schedule = {
      id: data.id,
      workTime:
        process.env.NODE_ENV === 'production' ? workTime * 3600 : workTime,
      breakTime:
        process.env.NODE_ENV === 'production' ? breakTime * 60 : breakTime,
      delayTime:
        process.env.NODE_ENV === 'production' ? delayTime * 60 : delayTime,
      name: formData.name,
      message: formData.message,
    };
    if (data.id === 0) {
      ipcRenderer.addConfig(schedule);
    } else {
      ipcRenderer.updateConfig(schedule);
    }
  };

  return (
    <Form
      layout="vertical"
      style={{ width: 350 }}
      form={form}
      onFinish={handleFinish}
    >
      <Form.Item name="name" label="名称" rules={[{ required: true }]}>
        <Input placeholder="请填写名称" />
      </Form.Item>

      <Form.Item
        label="工作时间（小时）"
        name="workTime"
        rules={[{ required: true, type: 'number', min: 1 }]}
      >
        <InputNumber
          min={1}
          style={{ width: '100%' }}
          placeholder="设置工作时间（小时）"
        />
      </Form.Item>
      <Form.Item
        label="休息时间（分钟）"
        name="breakTime"
        rules={[{ required: true, type: 'number', min: 1 }]}
      >
        <InputNumber
          min={1}
          style={{ width: '100%' }}
          placeholder="设置休息时间（分钟）"
        />
      </Form.Item>

      <Form.Item
        label="推迟时间（分钟）"
        name="delayTime"
        rules={[{ required: true, type: 'number', min: 1 }]}
      >
        <InputNumber
          min={1}
          style={{ width: '100%' }}
          placeholder="设置休息时间（分钟）"
        />
      </Form.Item>

      <Form.Item name="message" label="提示内容">
        <Input placeholder="请输入提示内容" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ScheduleForm;
