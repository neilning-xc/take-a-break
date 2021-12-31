import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Exclude from '../renderer/views/Exclude';

describe('Exclude Component', () => {
  it('render Exclude', () => {
    render(<Exclude />);

    expect(screen.getByText('例外程序')).toBeInTheDocument();
    expect(screen).toMatchSnapshot();
  });
});
