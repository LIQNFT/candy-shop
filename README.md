# Candy Shop

Candy Shop is JavaScript library that allows DAOs, NFT projects and anyone to create an NFT marketplace on Solana in minutes!

Drawing inspiration from Project Serum’s mission to accelerate Solana’s on-chain trading infrastructure, Candy Shop aspires to do the same for the Solana NFT marketplace ecosystem.

Candy Shop provides an easy to integrate marketplace protocol & toolset with a full suite of data endpoints and command APIs to help  users deliver a simplistic, seamless and efficient NFT marketplace experience. 

Key features:
* **Simple Integration.** Integrate marketplace features into your website easily with Candy Shop SDK - your marketplace could be fully operational within a few minutes. 
* **Seamless User Experience.** The commands and data endpoints have been designed in a way to simplify user journey and provide a seamless experience for browsing, buying and selling NFTs on your in-house marketplace.
* **Give More, Earn More.** Users save on transaction fees when they transact on your Candy Shop marketplace, and you will also earn 20% of the 1% transaction fee. 
* **Candy Shop Network.** Standardized implementation allows you to import other Candy Shop NFT listings directly onto your marketplace or vice versa - creating a network effect of listings for maximum traffic flow
* **Transparency.** Candy Shop is an open source and on-chain protocol, providing your community with full transparency on what is happening behind the scene for your marketplace. 

Links:
* [Website](https://liqnft.github.io/solana-candy-shop/)
* [Demo](https://liqnft.github.io/candy-shop/)
* [Whitepaper](https://liqnft.gitbook.io/candy-shop/)

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

### Init CandyShop

```
const candyShop = new CandyShop(
  new PublicKey("EzDnyZvt7XtB65DBpQELgtWPeDFae2u9JvAQTkWq9pb7"), // your Candy Shop address
  new PublicKey("BSPpKnfVMbnDfQKgJzUTQHVa78YY8FYqv8ttMwAG7sZn"), // Candy Shop creator address
  new PublicKey("FmDt3mTCWsF4xCGteZNQihqbjEdCqNcGPqg9NRJWkgxq"), // Candy Shop program id
  "devnet", // mainnet, devnet
  wallet! // user wallet address
);
```

### Show Orders and Buy Interface

Show the NFTs that are for sale and allow users to connect their wallet and buy them.

```
import { Orders } from '@liqnft/candy-shop';

<Orders
  connection={connection}
  walletPublicKey={publicKey}
  candyShop={candyShop}
  walletConnectComponent={<WalletMultiButton />}
/>
```

### Show Sell Interface

Show sell interface that allows users to connect their wallet and list their NFTs for sale.

```
import { Sell } from '@liqnft/candy-shop';

<Sell
  connection={connection}
  walletPublicKey={publicKey}
  candyShop={candyShop}
  walletConnectComponent={<WalletMultiButton />}
/>

```

### Custom Marketplace Builds

You can also ship your own custom marketplace using the methods below.

```
import { CandyShop } from '@liqnft/candy-shop';

// Initialize your store
const candy = new CandyShop(
  new PublicKey("EzDnyZvt7XtB65DBpQELgtWPeDFae2u9JvAQTkWq9pb7"), // your Candy Shop address
  new PublicKey("BSPpKnfVMbnDfQKgJzUTQHVa78YY8FYqv8ttMwAG7sZn"), // Candy Shop creator address
  new PublicKey("FmDt3mTCWsF4xCGteZNQihqbjEdCqNcGPqg9NRJWkgxq"), // Candy Shop program id
  "devnet", // mainnet, devnet
  wallet! // user wallet address
);

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
