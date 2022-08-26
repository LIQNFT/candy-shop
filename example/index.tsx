import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'react-app-polyfill/ie11';
import { EthExample } from './EthExample';
import { SolExample } from './SolExample';

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/eth">
          <EthExample />
        </Route>
        <Route path="/">
          <SolExample />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
