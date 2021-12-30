import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { App } from '../renderer/App';

describe('App', () => {
  it('render Action', () => {
    const history = createMemoryHistory();
    history.push('/action');

    const app = render(
      <Router history={history}>
        <App />
      </Router>
    );

    expect(app.getByText('跳过')).toBeInTheDocument();
    expect(app.getByText('推迟')).toBeInTheDocument();
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
