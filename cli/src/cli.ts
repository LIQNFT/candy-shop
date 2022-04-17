import { PublicKey } from '@solana/web3.js';
import { Command } from 'commander';
import {
  buyAndExecuteSale,
  cancelOrder,
  sellNft,
} from '@liqnft/candy-shop-sdk';
import {
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseFeeAcct,
  getAuctionHouseTradeState,
  getAuctionHouseTreasuryAcct,
  getCandyShop,
} from '@liqnft/candy-shop-sdk/dist/api/utils';
import * as anchor from '@project-serum/anchor';

import { getMetadataAccount, loadWalletKeyAndProgram } from './helper/account';

const CMD = new Command();

function programCommand(name: string) {
  return CMD.command(name)
    .requiredOption(
      '-e, --env <string>',
      'Solana cluster env name',
      'devnet' //mainnet-beta, testnet, devnet
    )
    .requiredOption(
      '-k, --keypair <path>',
      `Solana wallet location`,
      '--keypair not provided'
    );
}

programCommand('sell')
  .requiredOption('-ta, --token-account <string>')
  .requiredOption('-tam, --token-account-mint <string>')
  .requiredOption('-tm, --treasury-mint <string>')
  .requiredOption('-sc, --shop-creator <string>')
  .requiredOption('-p, --price <string>')
  .action(async (name, cmd) => {
    console.log(name);

    let {
      keypair,
      env,
      tokenAccount,
      tokenAccountMint,
      treasuryMint,
      price,
      shopCreator,
    } = cmd.opts();

    const [walletKeyPair, program] = await loadWalletKeyAndProgram(
      keypair,
      env
    );

    const [auctionHouseAuthority, authorityBump] =
      await getAuctionHouseAuthority(
        new PublicKey(shopCreator),
        new PublicKey(treasuryMint),
        program.programId
      );

    const [candyShop] = await getCandyShop(
      new PublicKey(shopCreator),
      new PublicKey(treasuryMint),
      program.programId
    );

    const [auctionHouse] = await getAuctionHouse(
      auctionHouseAuthority,
      new PublicKey(treasuryMint)
    );

    console.log('auctionHouse ', auctionHouse.toString());
    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(
      new PublicKey(tokenAccountMint)
    );

    const txHash = await sellNft(
      walletKeyPair,
      new PublicKey(tokenAccount),
      new PublicKey(tokenAccountMint),
      new PublicKey(treasuryMint),
      metadata,
      auctionHouseAuthority,
      authorityBump,
      auctionHouse,
      feeAccount,
      candyShop,
      new anchor.BN(price),
      new anchor.BN(1),
      program
    );

    console.log('txHash', txHash);
  });

programCommand('cancel')
  .requiredOption('-ta, --token-account <string>')
  .requiredOption('-tam, --token-account-mint <string>')
  .requiredOption('-tm, --treasury-mint <string>')
  .requiredOption('-sc, --shop-creator <string>')
  .requiredOption('-p, --price <string>')
  .action(async (name, cmd) => {
    console.log(name);

    let {
      keypair,
      env,
      tokenAccount,
      tokenAccountMint,
      treasuryMint,
      price,
      shopCreator,
    } = cmd.opts();

    const [walletKeyPair, program] = await loadWalletKeyAndProgram(
      keypair,
      env
    );

    const [auctionHouseAuthority, authorityBump] =
      await getAuctionHouseAuthority(
        new PublicKey(shopCreator),
        new PublicKey(treasuryMint),
        program.programId
      );

    const [candyShop] = await getCandyShop(
      new PublicKey(shopCreator),
      new PublicKey(treasuryMint),
      program.programId
    );

    const [auctionHouse] = await getAuctionHouse(
      auctionHouseAuthority,
      new PublicKey(treasuryMint)
    );

    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);

    const [tradeState] = await getAuctionHouseTradeState(
      auctionHouse,
      walletKeyPair.publicKey,
      new PublicKey(tokenAccount),
      new PublicKey(treasuryMint),
      new PublicKey(tokenAccountMint),
      new anchor.BN(1),
      new anchor.BN(price)
    );

    const txHash = await cancelOrder(
      walletKeyPair,
      new PublicKey(tokenAccount),
      new PublicKey(tokenAccountMint),
      auctionHouseAuthority,
      authorityBump,
      auctionHouse,
      feeAccount,
      tradeState,
      candyShop,
      new anchor.BN(price),
      new anchor.BN(1),
      program
    );

    console.log('txHash', txHash);
  });

programCommand('buy')
  .requiredOption('-s, --seller <string>')
  .requiredOption('-ta, --token-account <string>')
  .requiredOption('-tam, --token-account-mint <string>')
  .requiredOption('-tm, --treasury-mint <string>')
  .requiredOption('-sc, --shop-creator <string>')
  .requiredOption('-p, --price <string>')
  .action(async (name, cmd) => {
    console.log(name);

    let {
      keypair,
      env,
      seller,
      tokenAccount,
      tokenAccountMint,
      treasuryMint,
      shopCreator,
      price,
    } = cmd.opts();

    const [walletKeyPair, program] = await loadWalletKeyAndProgram(
      keypair,
      env
    );

    const [auctionHouseAuthority, authorityBump] =
      await getAuctionHouseAuthority(
        new PublicKey(shopCreator),
        new PublicKey(treasuryMint),
        program.programId
      );

    const [candyShop] = await getCandyShop(
      new PublicKey(shopCreator),
      new PublicKey(treasuryMint),
      program.programId
    );

    const [auctionHouse] = await getAuctionHouse(
      auctionHouseAuthority,
      new PublicKey(treasuryMint)
    );
    const [feeAccount] = await getAuctionHouseFeeAcct(auctionHouse);
    const [treasuryAccount] = await getAuctionHouseTreasuryAcct(auctionHouse);

    const [metadata] = await getMetadataAccount(
      new PublicKey(tokenAccountMint)
    );

    const txHash = await buyAndExecuteSale(
      walletKeyPair,
      new PublicKey(seller),
      new PublicKey(tokenAccount),
      new PublicKey(tokenAccountMint),
      new PublicKey(treasuryMint),
      treasuryAccount,
      metadata,
      auctionHouseAuthority,
      authorityBump,
      auctionHouse,
      feeAccount,
      candyShop,
      new anchor.BN(price),
      new anchor.BN(1),
      program
    );

    console.log('txHash', txHash);
  });

CMD.parse(process.argv);
