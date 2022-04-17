# Candy Shop

**IN BETA**

Candy Shop is a JavaScript library that allows DAOs, NFT projects and anyone to create an NFT marketplace on Solana in minutes!

Drawing inspiration from Project Serum’s mission to accelerate Solana’s on-chain trading infrastructure, Candy Shop aspires to do the same for the Solana NFT marketplace ecosystem.

Candy Shop provides an easy to integrate marketplace protocol & toolset with a full suite of data endpoints and command APIs to help  users deliver a simplistic, seamless and efficient NFT marketplace experience. For different marketplace hosting options, please refer to [this doc](Market.md)

Key features:
* **Simple Integration.** Integrate marketplace features into your website easily with Candy Shop SDK - your marketplace could be fully operational within a few minutes. 
* **Seamless User Experience.** The commands and data endpoints have been designed in a way to simplify user journey and provide a seamless experience for browsing, buying and selling NFTs on your in-house marketplace.
* **Give More, Earn More.** Users save on transaction fees when they transact on your Candy Shop marketplace, and you will also earn 20% of the 1% transaction fee. 
* **Candy Shop Network.** Standardized implementation allows you to import other Candy Shop NFT listings directly onto your marketplace or vice versa - creating a network effect of listings for maximum traffic flow
* **Transparency.** Candy Shop is an open source and on-chain protocol, providing your community with full transparency on what is happening behind the scene for your marketplace. 

Links:
* [Website + Demo](https://candy.liqnft.com)
* [Whitepaper](https://liqnft.gitbook.io/candy-shop/)
* [Candy Machine V2 + Candy Shop Starter Repo](https://github.com/LIQNFT/candy-machine-v2-with-marketplace)
* [Support](https://discord.com/invite/PYZWRHgVwM)

<img width="1200" alt="Candy Shop Marketplace" src="https://user-images.githubusercontent.com/89616076/160229442-30f59d07-cd33-4b7d-8798-424013731f47.png">

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

### Create Candy Shop

Create your Candy Shop [here](https://candy.liqnft.com/my-shop).

You can configure the following in My Shop:

* Create a shop with SOL or an SPL token as transaction currency
* Deposit syrup, a small budget to maintain your shop (e.g. gas fees for on-chain account space allocation)
* Restrict NFT collections that can be bought and sold on your shop
* Claim share of transaction fees from your shop


### Init CandyShop

Use code in the `/example` folder as reference to setup and instantiate CandyShop.

```ts
const candyShop = new CandyShop(
  new PublicKey("Fo2cXie4UwreZi7LHMpnsyVPvzuo4FMwAVbSUYQsmbsh"), // creator address (i.e. your wallet address)
  new PublicKey("So11111111111111111111111111111111111111112"), // treasury mint (i.e. currency to buy and sell with)
  new PublicKey("csa8JpYfKSZajP7JzxnJipUL3qagub1z29hLvp578iN"), // Candy Shop program id
  "devnet", // mainnet, devnet
  settings // (optional) additional shop settings
);
```

You may pass an additional settings object to customize your shop:

* **currencySymbol: string** your shop transaction currency symbol (default is SOL)
* **currencyDecimals: number** your shop transaction currency decimals (default is 9 for SOL)
* **priceDecimals: number** number of decimals to display for price numbers (default is 3)
* **volumeDecimals: number** number of decimals to display for volume numbers (default is 1)

Example settings object:

```ts
const settings = {
  currencySymbol: 'SOL',
  currencyDecimals: 9,
  priceDecimals: 3,
  volumeDecimals: 1
};
```

### Show Orders and Buy Interface

Show the NFTs that are for sale and allow users to connect their wallet and buy them.

```ts
import { Orders } from '@liqnft/candy-shop';

<Orders
  wallet={wallet}
  candyShop={candyShop}
  walletConnectComponent={<WalletMultiButton />}
/>
```

Additional params:
* **filters: Array<{ name: string, identifier: number}>** You can let users filter by NFT collection by specifying the filters parameter. Name is the label shown in the filter box. Identifier is the unique NFT collection identifier, which you can get by whitelisting an NFT collection in My Shop or by using the getIdentifier helper method in the Candy Shop library
* **identifiers: Array<number>** By default, only show orders from certain NFT collections. Takes an array of identifiers.
* **url: string** When user clicks on an NFT order, direct user to a new route instead of opening a buy NFT modal. Route should be in form of `/my-route/:tokenMint` where `:tokenMint` will be replaced by the NFT token mint

### Show Sell Interface

Show sell interface that allows users to connect their wallet and list their NFTs for sale.

```ts
import { Sell } from '@liqnft/candy-shop';

<Sell
  connection={connection}
  wallet={wallet}
  candyShop={candyShop}
  walletConnectComponent={<WalletMultiButton />}
/>
```

### Show Stats

Show key stats about your collection

```ts
import { Stats } from '@liqnft/candy-shop';

<Stat
  candyShop={candyShop}
  title={'Marketplace'}
  description={'Candy Shop is an open source on-chain protocol that empowers DAOs, NFT projects and anyone interested in creating an NFT marketplace to do so within minutes!'}
/>
```

### Buy Single NFT Interface

Show buy interface for a single NFT order. This component can be used by specifying the `url` param to the Orders component. Token mint can be parsed from the URL and inserted into the OrderDetail component.

```ts
import { OrderDetail } from '@liqnft/candy-shop';

<OrderDetail
  tokenMint={'WfL9fAggBMHmjvBEu1v53fQkRmB3Cn4giJSSQxVSC5W'} // token mint of the NFT
  backUrl={'/'} // will redirect to this route after sale is completed
  candyShop={candyShop}
  walletConnectComponent={<WalletMultiButton />}
  wallet={wallet}
/>
```

### Custom Marketplace Builds

You can also ship your own custom marketplace using the methods below, neatly with the `candy-shop-sdk` pacakge.

// Fetch orders
candyShop.getOrders();

// Buy
candyShop.buy();

// Sell
candyShop.sell();

// Cancel sell order
candyShop.cancel();

// Get statistics
candyShop.getStats();

// Get transactions
candyShop.getTransactions();
```

## For Contributors

In first console, run the NPM module

```bash
cd lib
yarn
yarn start
```

This builds to `/lib/dist` and runs the project in watch mode so any edits you save inside `/lib/src` causes a rebuild to `/lib/dist`.

In second console, run example:

```bash
# in example folder
yarn

# in root folder
yarn
yarn start
```

To publish

```bash
# in lib folder
npm publish
```
