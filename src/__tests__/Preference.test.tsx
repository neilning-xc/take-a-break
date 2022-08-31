import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Preference from '../renderer/views/Preference';

describe('Preference Component', () => {
  it('render Preference', () => {
    render(<Preference />);

    expect(screen.getByText('锁屏时跳过')).toBeInTheDocument();
    expect(screen.getByText('开机启动')).toBeInTheDocument();

    expect(screen).toMatchSnapshot();
  });
});
