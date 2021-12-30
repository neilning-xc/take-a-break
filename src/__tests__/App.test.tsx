import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { App } from '../renderer/App';

describe('App', () => {
  it('render Action', () => {
    const history = createMemoryHistory();
    history.push('/action');

    render(
      <Router history={history}>
        <App />
      </Router>
    );

    expect(screen.getByText('跳过')).toBeInTheDocument();
    expect(screen.getByText('推迟')).toBeInTheDocument();
  });

  it('render Main', () => {
    const history = createMemoryHistory();

    const app = render(
      <Router history={history}>
        <App />
      </Router>
    );

    expect(app.getByRole('img')).toBeInTheDocument();
  });

  it('render Setting', () => {
    jest.mock('react-router-dom', () => {
      return {
        Switch: <div />,
      };
    });

    const history = createMemoryHistory();
    history.push('setting/preference');

    const app = render(
      <Router history={history}>
        <App />
      </Router>
    );

    expect(app.getByRole('checkbox')).toBeInTheDocument();
  });
});
