import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { OrderList, Sell } from '../.';

const App = () => {
  return (
    <div>
      <h1>Order List</h1>
      <OrderList />
      <h1>Sell</h1>
      <Sell />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
