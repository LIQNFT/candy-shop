# Candy Shop CLI

Command line interface for interacting with Candy Shop

```
ts-node src/cli.ts --help

Commands:
  sellMany [options]       list many NFTs for sale
  cancelMany [options]     cancel many NFT listings
  sell [options]           list one NFT for sale
  cancel [options]         cancel one NFT listing
  buy [options]            buy a listed NFT
  createAuction [options]  create auction for a specified NFT
  cancelAuction [options]  cancel auction for a specified NFT
  makeBid [options]        make bid to an auction
  withdrawBid [options]    withdraw bid to an auction
  help [command]           display help for command
```

Note:
1. user cannot buy an NFT that was listed for sale with the same wallet address as it would result in an on-chain error
