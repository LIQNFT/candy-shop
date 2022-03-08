import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Buy, Sell } from '../.';

const App = () => {
  return (
    <div style={{paddingTop: 30, paddingBottom: 30}}>
      <div style={{marginBottom: 50}}>
        <h1 style={{textAlign: 'center'}}>Buy</h1>
        <Buy storeId={'5wbadqR2UBmV8AUBKxAE64z5ASBorsUofoHQWhJSVYpZ'} />
      </div>
      <div style={{marginBottom: 50}}>
        <h1 style={{textAlign: 'center'}}>Sell</h1>
        <Sell />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
