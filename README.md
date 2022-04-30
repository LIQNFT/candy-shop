# Candy Shop: Solana NFT Marketplace JavaScript Library
### In Beta

**Contents**

* [Intro](#intro)
* [Key Features](#key-features)
* [Invoke Your Candy Shop](#invoke-your-candy-shop)
* [Install Candy Shop](#install-candyshop)
  - [How to use CandyShop](#how-to-use-candyshop)
* [Customize Your Marketplace](#customize-your-marketplace)
  - [How to use sdk](#how-to-use-sdk)
* [Embedded UI Usages](#embedded-ui-usages)
* [Solana Transaction Size Limit](#%EF%B8%8F-solana-transaction-size-limit-%EF%B8%8F)
* [Contribute to Candy Shop](#contribute-to-candy-shop)

## Intro
Candy Shop is a JavaScript library that allows DAOs, NFT projects and anyone to create an NFT marketplace on Solana in minutes!

Drawing inspiration from Project Serum’s mission to accelerate Solana’s on-chain trading infrastructure, Candy Shop aspires to do the same for the Solana NFT marketplace ecosystem.

Candy Shop provides an easy to integrate marketplace protocol & toolset with a full suite of data endpoints and command APIs to help  users deliver a simplistic, seamless and efficient NFT marketplace experience. For different marketplace hosting options, please refer to [this doc](Market.md)

### Links
- [Website + Demo](https://candy.liqnft.com)
- [Whitepaper](https://liqnft.gitbook.io/candy-shop/)
- [Candy Machine V2 + Candy Shop Starter Repo](https://github.com/LIQNFT/candy-machine-v2-with-marketplace)
- [Support](https://discord.com/invite/PYZWRHgVwM)

<img width="1200" alt="Candy Shop Marketplace" src="https://user-images.githubusercontent.com/89616076/160229442-30f59d07-cd33-4b7d-8798-424013731f47.png">

## Key Features

- **Simple Integration.** 
  - Integrate marketplace features into your website easily with Candy Shop SDK - your marketplace could be fully operational within a few minutes. 
- **Seamless User Experience.** 
  - The commands and data endpoints have been designed in a way to simplify user journey and provide a    seamless experience for browsing, buying and selling NFTs on your in-house marketplace.
- **Give More, Earn More.** 
  - Users save on transaction fees when they transact on your Candy Shop marketplace, and you will also earn 20% of the 1% transaction fee. 
- **Candy Shop Network.** 
  - Standardized implementation allows you to import other Candy Shop NFT listings directly onto your marketplace or vice versa - creating a network effect of listings for maximum traffic flow
- **Transparency.** 
  - Candy Shop is an open source and on-chain protocol, providing your community with full transparency on what is happening behind the scene for your marketplace. 


## Invoke Your Candy Shop

Create your Candy Shop [here](https://candy.liqnft.com/my-shop).

You can configure the following in My Shop:

* Create a shop with SOL or an SPL token as transaction currency
* Deposit syrup, a small budget to maintain your shop (e.g. gas fees for on-chain account space allocation)
* Restrict NFT collections that can be bought and sold on your shop
* Claim share of transaction fees from your shop


## Install CandyShop

```bash
npm install @liqnft/candy-shop
```
or

```bash
yarn add @liqnft/candy-shop
```

## Releases

Please refer to the tags for the releases. Branch `master` contains the latest changes and might not be ready for production uses.


### How to use CandyShop

**Refer to `/example` folder to instantiate `CandyShop`**

```ts
const candyShop = new CandyShop(
  new PublicKey("Fo2cXie4UwreZi7LHMpnsyVPvzuo4FMwAVbSUYQsmbsh"), // creator address (i.e. your wallet address)
  new PublicKey("So11111111111111111111111111111111111111112"), // treasury mint (i.e. currency to buy and sell with)
  new PublicKey("csa8JpYfKSZajP7JzxnJipUL3qagub1z29hLvp578iN"), // Candy Shop program id
  "devnet", // mainnet, devnet
  settings // (optional) additional shop settings
);
```

#### Default settings

```ts
const settings = {
  currencySymbol: 'SOL',
  currencyDecimals: 9,
  priceDecimals: 3,
  volumeDecimals: 1,
  mainnetConnectionUrl: "https://ssc-dao.genesysgo.net/",
  connectionConfig: {
    httpHeaders: {
      '[NODE_SPECIFIC_HEADERS]': '[VALUE]'
    }
  }
};
```

#### Additional Settings

You may pass an additional settings object to customize your shop:

- `currencySymbol: string`
  - your shop transaction currency symbol (default is SOL)
- `currencyDecimals: number` 
  - your shop transaction currency decimals (default is 9 for SOL)
- `priceDecimals: number` 
  - number of decimals to display for price numbers (default is 3)
- `volumeDecimals: number` 
  - number of decimals to display for volume numbers (default is 1)
- `mainnetConnectionUrl: string` 
  - your mainnet connection node url (default is https://ssc-dao.genesysgo.net/)
- `connectionConfig: object` 
  - your mainnet connection node url configuration


## Customize Your Marketplace

`@liqnft/candy-shop-sdk` that inside `@liqnft/candy-shop`, allows you to ship your own custom marketplace with desired UI by calling methods below.

### How to use sdk
```ts
import { CandyShop } from '@liqnft/candy-shop-sdk';
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

## Embedded UI Usages
We provide a few built-in UI to speed up building your market place without crafting the styles. If you want to have your own styles, please refer to [Customize Your Marketplace](#customize-your-marketplace) section that just using the sdk to perform the marketplace functions.
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

#### Additional params:
- `filters: Array<{ name: string, identifier: number}>`
  - You can let users filter by NFT collection by specifying the filters parameter. Name is the label shown in the filter box. Identifier is the unique NFT collection identifier, which you can get by whitelisting an NFT collection in My Shop or by using the getIdentifier helper method in the Candy Shop library
- `identifiers: Array<number>`
  - By default, only show orders from certain NFT collections. Takes an array of identifiers.
- `url: string` 
  - When user clicks on an NFT order, direct user to a new route instead of opening a buy NFT modal. Route should be in form of `/my-route/:tokenMint` where `:tokenMint` will be replaced by the NFT token mint

### Show Sell Interface

Show sell interface that allows users to connect their wallet and list their NFTs for sale.

```ts
import { Sell } from '@liqnft/candy-shop';

<Sell
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

## ⚠️ Solana Transaction Size Limit ⚠️

For Candy Shops that use a SPL token as the payment currency, if any NFT's are listed on it that have 4 creators or more, users trying to buy those NFT's will not be able to successfully do so. This is because in this case, the Solana transaction size becomes too large, exceeding the current Solana transaction size limit. Workarounds for this issue are actively being looked into.

# Contribute to Candy Shop

We're welcoming to receive any contribution for candy-shop! Feel free to open a PR can request LIQNFT team to review.

Following is some set up you might need to know before building up together.
## Prerequisite

Install Node (above 14.17.x), NPM, Yarn

## Launch example

Installing & Building all required packages by `setup.sh`

```bash
// run chmod when executing it first time
chmod 755 setup.sh 
./setup.sh
```

In root folder, hosting dist from example at `localhost:1234`

```bash
yarn start
```

## Clean node_modules for clean building

In root folder

```bash
yarn clean:all
```
## Formatting

In root folder

```bash
yarn format:fix
```
