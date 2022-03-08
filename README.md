# Solana Candy Shop

JavaScript library that allows any NFT project to host their own NFT marketplace easily

## Installation

Using npm:

```
npm install @liqnft/candy-shop
```

Using yarn:
```
yarn add @liqnft/candy-shop
```

## Usage

Show Orders and Buy

```
import { Orders } from '@liqnft/candy-shop';

<Orders
  storeId={'5wbadqR2UBmV8AUBKxAE64z5ASBorsUofoHQWhJSVYpZ'}
  connection={connection}
  walletPublicKey={publicKey}
  walletConnectComponent={<WalletMultiButton />}
/>
```

Sell

```
import { Sell } from '@liqnft/candy-shop';

<Sell
  storeId={'5wbadqR2UBmV8AUBKxAE64z5ASBorsUofoHQWhJSVYpZ'}
  connection={connection}
  walletPublicKey={publicKey}
  walletConnectComponent={<WalletMultiButton />}
/>

```

Custom Builds

```
import { CandyShop } from '@liqnft/candy-shop';

// Initialize your store
let candy = new CandyShop('4kBivZofAPfWFRYwgWrSbinB9XVFYSVYmB65mjmKCkpe');

// Fetch orders
candy.getOrders();

// Buy
candy.buy();

// Sell
candy.sell();

// Cancel sell order
candy.cancel();

// Get statistics
candy.getStats();

// Get transactions
candy.getTransactions();
```

## For Contributors

Candy Shop is built with TSDX, which scaffolds the library inside `/src`, and also sets up a [Parcel-based](https://parceljs.org) playground for it inside `/example`.

The recommended workflow is to run TSDX in one terminal:

```bash
npm start # or yarn start
```

This builds to `/dist` and runs the project in watch mode so any edits you save inside `src` causes a rebuild to `/dist`.

Then run the example inside another:

```bash
cd example
npm i # or yarn to install dependencies
npm start # or yarn start
```

The default example imports and live reloads whatever is in `/dist`, so if you are seeing an out of date component, make sure TSDX is running in watch mode like we recommend above. **No symlinking required**, we use [Parcel's aliasing](https://parceljs.org/module_resolution.html#aliases).

To do a one-off build, use `npm run build` or `yarn build`.

To run tests, use `npm test` or `yarn test`.