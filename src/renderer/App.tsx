import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import Main from './views/Main';
import Setting from './views/Setting';
import Action from './views/Action';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/setting" component={Setting} />
        <Route path="/action" component={Action} />
        <Route path="/" component={Main} />
      </Switch>
    </Router>
  );
}
