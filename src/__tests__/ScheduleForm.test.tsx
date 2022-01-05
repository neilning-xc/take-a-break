import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScheduleForm from '../renderer/components/ScheduleForm';

const { ipcRenderer } = electron;

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
    const spy = jest.spyOn(ipcRenderer, 'addConfig');
    const nameInput = screen.getByPlaceholderText('请填写名称');
    userEvent.type(nameInput, '一');
    expect((nameInput as any).value).toBe('休息计划一');
    const saveBtn = screen.getByRole('button', { name: '保 存' });
    userEvent.click(saveBtn);

    ipcRenderer.addConfig();
    expect(spy).toHaveBeenCalled();
  });
});
