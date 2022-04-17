CandyShop CLI

Sell

```
ts-node src/cli.ts sell -e devnet -k <keypair>.json -ta <TokenAccount> -tam <tokenAccountMint>  -tm <TreasuryMint> -p <PriceInDecimals> -sc <ShopCreator>
```

Cancel

```
ts-node src/cli.ts cancel -e devnet -k <keypair>.json -ta <TokenAccount> -tam <tokenAccountMint>  -tm <TreasuryMint> -p <PriceInDecimals> -sc <ShopCreator>
```

Buy

```
ts-node src/cli.ts buy -e devnet -k <keypair>.json -s <Seller> -ta <TokenAccount> -tam <tokenAccountMint>  -tm <TreasuryMint> -p <PriceInDecimals> -sc <ShopCreator>
```

Note:

1. user cannot self sell and buy, will result in error