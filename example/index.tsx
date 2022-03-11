import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import OrderList from './src/components/OrderList';
import NftsList from './src/components/NftsList';

const App = () => {
  return (
    <div>
      <h1>Order List</h1>
      <OrderList />
      <h1>Order Detail</h1>
      {/* <OrderDetail /> */}
      <h1>Sell</h1>
      <NftsList />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
