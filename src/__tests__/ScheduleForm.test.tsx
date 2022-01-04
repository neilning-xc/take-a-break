import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import ScheduleForm from '../renderer/components/ScheduleForm';

let data: Schedule;
beforeEach(() => {
  data = {
    id: 0,
    name: '休息计划',
    message: '工作这么久了，请休息一下☕️',
    workTime: 3600,
    breakTime: 180,
    delayTime: 300,
  };
});

describe('Schedule Component', () => {
  it('render ScheduleForm', () => {
    render(<ScheduleForm data={data} />);

    expect(screen.getByText('名称')).toBeInTheDocument();
    expect(screen).toMatchSnapshot();
  });

  it('update form', () => {
    render(<ScheduleForm data={data} />);
    const nameInput = screen.getByPlaceholderText('请填写名称');
    fireEvent.change(nameInput, { target: { value: '休息计划一' } });
    expect(nameInput.value).toBe('休息计划一');
    const saveBtn = screen.getByText('保存');
    fireEvent.click(saveBtn);
  });
});
