import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuItem from '../renderer/components/MenuItem';

let data: Schedule;
beforeEach(() => {
  data = {
    id: 1,
    name: '休息计划',
    message: '工作这么久了，请休息一下☕️',
    workTime: 3600,
    breakTime: 180,
    delayTime: 300,
  };
});

describe('MenuItem Component', () => {
  it('render MenuItem', () => {
    render(<MenuItem currentId={data.id} data={data} />);

    expect(screen.getByText('休息计划')).toBeInTheDocument();
    expect(
      screen
        .getByRole('heading', { level: 4 })
        .getAttribute('style')
        ?.includes('rgb(16, 142, 233)')
    ).toBeTruthy();
    expect(screen).toMatchSnapshot();
  });

  it('hover MenuItem', async () => {
    render(<MenuItem currentId={data.id} data={data} />);

    const hoverBtn = screen.getByRole('button', { name: 'setting 其他' });

    expect(screen.queryByText('休息')).not.toBeInTheDocument();
    expect(screen.queryByText('暂停')).not.toBeInTheDocument();

    userEvent.hover(hoverBtn);

    await waitFor(() => {
      expect(screen.queryByText('休息')).toBeInTheDocument();
      expect(screen.queryByText('暂停')).toBeInTheDocument();
    });
  });
});
