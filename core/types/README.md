# Solana Candy Shop Schema

Defines the schema shared between the backend and frontend component

### Content

##### reponse

Defines the API reponse format, `common.ts` lays out the base of the API response, and the generic `T` is from the respective defintiion defined under `/response`

##### query

Defines the query string for some specific API paths


#### Available APIs

```
- GET /api/order/{storeId}
    Fetch orders given storeId

- GET /api/trade/{storeId}
    Fetch trades given storeId

- GET /api/stats/{storeId}
    Fetch market place stats given storeId

- GET /api/stats/{storeId}/{mint}
    Fetch trade stats given Nft Mint

- GET /api/shop/{walletAddress}
    Fetch shop by owner address

- GET /api/shop/wlNfts/{storeId}
    Fetch shop whitelist nft

- GET /api/nft/{tokenMint}
    Fetch nft info by token mint
```

#### Publish package

1. Please format the code before building.
2. To Format run command  `yarn format`
3. To build run command  `yarn build`
4. Finally, please add `dist` directory to commit.
