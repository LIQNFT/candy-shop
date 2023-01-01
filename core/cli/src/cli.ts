import { CandyShop, CandyShopError, CandyShopErrorType } from '../../sdk/src';
import { getAvailableEditionNumbers, createNewMintInstructions, CandyShopDrop } from '../../sdk/src/CandyShopDrop';
import { getEditionVaultAccount, getAuctionHouse, getAuctionHouseAuthority } from '../../sdk/src/vendor';
import * as anchor from '@project-serum/anchor';
import { BN } from '@project-serum/anchor';
import { getAccount } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { Command } from 'commander';
import {
  CANDY_SHOP_PROGRAM_ID,
  CANDY_SHOP_V2_PROGRAM_ID,
  loadKey,
  loadTokenAccountMints,
  findAssociatedTokenAddress,
  isEnterprise
} from './helper/utils';
import fs from 'fs';

const CMD = new Command();

CMD.description('CLI for interacting with Candy Shop');

function programCommand(name: string) {
  return CMD.command(name)
    .requiredOption(
      '-e, --env <string>',
      'Solana cluster env name',
      'devnet' //mainnet-beta, testnet, devnet
    )
    .option('-r, --rpc-url <string>', '(optional) Solana mainnet RPC url')
    .option('-ie, --is-enterprise-arg', '(optional) Indiicates whether shop is enterprise or not')
    .requiredOption('-k, --keypair <path>', 'path to Solana wallet keypair')
    .requiredOption('-v, --version <v1 | v2>', 'version of the program');
}

programCommand('sellMany')
  .description('list many NFTs for sale')
  .requiredOption('-tam, --token-account-mint-list <path>', 'path to JSON file with array of NFT token mint addresses')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .requiredOption('-p, --price <string>', 'price in token decimals')
  .action(async (name, cmd) => {
    const { keypair, env, tokenAccountMintList, treasuryMint, price, shopCreator, rpcUrl, version, isEnterpriseArg } =
      cmd.opts();

    const candyShopProgramId = version === 'v1' ? CANDY_SHOP_PROGRAM_ID : CANDY_SHOP_V2_PROGRAM_ID;

    const wallet = loadKey(keypair);

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const tokenMints = loadTokenAccountMints(tokenAccountMintList);

    tokenMints.forEach(async (tokenMint) => {
      const tokenAccount = await findAssociatedTokenAddress(
        new anchor.web3.PublicKey(wallet.publicKey),
        new anchor.web3.PublicKey(tokenMint)
      );

      const txHash = await candyShop.sell({
        tokenAccount: tokenAccount,
        tokenMint: new anchor.web3.PublicKey(tokenMint),
        price: new anchor.BN(price),
        wallet
      });

      console.log('txHash', txHash);
    });
  });

programCommand('cancelMany')
  .description('cancel many NFT listings')
  .requiredOption('-tam, --token-account-mint-list <path>', 'path to JSON file with array of NFT token mint addresses')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .requiredOption('-p, --price <string>', 'price in token decimals')
  .action(async (name, cmd) => {
    const { keypair, env, tokenAccountMintList, treasuryMint, price, shopCreator, rpcUrl, version, isEnterpriseArg } =
      cmd.opts();

    const wallet = loadKey(keypair);

    const candyShopProgramId = version === 'v1' ? CANDY_SHOP_PROGRAM_ID : CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const tokenMints = loadTokenAccountMints(tokenAccountMintList);

    tokenMints.forEach(async (tokenMint) => {
      const tokenAccount = await findAssociatedTokenAddress(
        new anchor.web3.PublicKey(wallet.publicKey),
        new anchor.web3.PublicKey(tokenMint)
      );

      const txHash = await candyShop.cancel({
        tokenAccount: tokenAccount,
        tokenMint: new anchor.web3.PublicKey(tokenMint),
        price: new anchor.BN(price),
        wallet
      });

      console.log('txHash', txHash);
    });
  });

programCommand('sell')
  .description('list one NFT for sale')
  .requiredOption('-tam, --token-account-mint <string>', 'NFT token mint address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .requiredOption('-p, --price <string>', 'price in token decimals')
  .action(async (name, cmd) => {
    const { keypair, env, tokenAccountMint, treasuryMint, price, shopCreator, rpcUrl, version, isEnterpriseArg } =
      cmd.opts();

    const wallet = loadKey(keypair);

    const candyShopProgramId = version === 'v1' ? CANDY_SHOP_PROGRAM_ID : CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const tokenAccount = await findAssociatedTokenAddress(
      new anchor.web3.PublicKey(wallet.publicKey),
      new anchor.web3.PublicKey(tokenAccountMint)
    );

    const txHash = await candyShop.sell({
      tokenAccount: tokenAccount,
      tokenMint: new anchor.web3.PublicKey(tokenAccountMint),
      price: new anchor.BN(price),
      wallet
    });

    console.log('txHash', txHash);
  });

programCommand('cancel')
  .description('cancel one NFT listing')
  .requiredOption('-tam, --token-account-mint <string>', 'NFT token mint address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .requiredOption('-p, --price <string>', 'price in token decimals')
  .action(async (name, cmd) => {
    const { keypair, env, tokenAccountMint, treasuryMint, price, shopCreator, rpcUrl, version, isEnterpriseArg } =
      cmd.opts();

    const wallet = loadKey(keypair);

    const candyShopProgramId = version === 'v1' ? CANDY_SHOP_PROGRAM_ID : CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const tokenAccount = await findAssociatedTokenAddress(
      new anchor.web3.PublicKey(wallet.publicKey),
      new anchor.web3.PublicKey(tokenAccountMint)
    );

    const txHash = await candyShop.cancel({
      tokenAccount: tokenAccount,
      tokenMint: new anchor.web3.PublicKey(tokenAccountMint),
      price: new anchor.BN(price),
      wallet
    });

    console.log('txHash', txHash);
  });

programCommand('buy')
  .description('buy a listed NFT')
  .requiredOption('-s, --seller <string>', 'seller wallet address')
  .requiredOption('-ta, --token-account <string>', 'seller NFT token account address')
  .requiredOption('-tam, --token-account-mint <string>', 'NFT token mint address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .requiredOption('-p, --price <string>', 'price in token decimals')
  .action(async (name, cmd) => {
    const {
      keypair,
      env,
      seller,
      tokenAccount,
      tokenAccountMint,
      treasuryMint,
      shopCreator,
      price,
      rpcUrl,
      version,
      isEnterpriseArg
    } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShopProgramId = version === 'v1' ? CANDY_SHOP_PROGRAM_ID : CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const txHash = await candyShop.buy({
      seller: new anchor.web3.PublicKey(seller),
      tokenAccount: new anchor.web3.PublicKey(tokenAccount),
      tokenMint: new anchor.web3.PublicKey(tokenAccountMint),
      price: new anchor.BN(price),
      wallet
    });

    console.log('txHash', txHash);
  });

programCommand('createAuction')
  .description('create auction for a specified NFT')
  .requiredOption('-tam, --token-account-mint <string>', 'NFT token mint address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sb, --starting-bid <string>', 'Starting Bid, in the unit of treasury mint')
  .requiredOption('-st, --start-time <string>', 'Start Time, unix timestamp')
  .requiredOption('-ts, --tick-size <string>', 'Tick Size')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .requiredOption('-bp, --bidding-period <string>', 'Bidding Period in seconds')
  .option('-bnp, --buy-now-price <string>', 'Buy now price, in the unit of treasury mint, nullable')
  .option('-ep, --extension-period <string>', 'Extension period, in seconds, optional')
  .option('-ei, --extension-increment <string>', 'Extension increment, in seconds, optional')
  .action(async (name, cmd) => {
    const {
      keypair,
      env,
      tokenAccountMint,
      treasuryMint,
      rpcUrl,
      startingBid,
      biddingPeriod,
      tickSize,
      buyNowPrice,
      extensionPeriod,
      extensionIncrement,
      shopCreator,
      startTime,
      version,
      isEnterpriseArg
    } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShopProgramId = version === 'v1' ? CANDY_SHOP_PROGRAM_ID : CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const tokenAccount = await findAssociatedTokenAddress(
      new anchor.web3.PublicKey(wallet.publicKey),
      new anchor.web3.PublicKey(tokenAccountMint)
    );

    const txHash = await candyShop.createAuction({
      tokenAccount: tokenAccount,
      tokenMint: new anchor.web3.PublicKey(tokenAccountMint),
      startingBid: new anchor.BN(startingBid),
      startTime: new anchor.BN(startTime),
      biddingPeriod: new anchor.BN(biddingPeriod),
      tickSize: new anchor.BN(tickSize),
      buyNowPrice: buyNowPrice ? new anchor.BN(buyNowPrice) : null,
      extensionPeriod: extensionPeriod ? new BN(extensionPeriod) : undefined,
      extensionIncrement: extensionIncrement ? new BN(extensionIncrement) : undefined,
      wallet
    });

    console.log('txHash', txHash);
  });

programCommand('cancelAuction')
  .description('cancel auction for a specified NFT')
  .requiredOption('-tam, --token-account-mint <string>', 'NFT token mint address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .action(async (name, cmd) => {
    const { keypair, env, tokenAccountMint, treasuryMint, rpcUrl, shopCreator, version, isEnterpriseArg } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShopProgramId = version === 'v1' ? CANDY_SHOP_PROGRAM_ID : CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const tokenAccount = await findAssociatedTokenAddress(
      new anchor.web3.PublicKey(wallet.publicKey),
      new anchor.web3.PublicKey(tokenAccountMint)
    );

    const txHash = await candyShop.cancelAuction({
      tokenAccount: tokenAccount,
      tokenMint: new anchor.web3.PublicKey(tokenAccountMint),
      wallet
    });

    console.log('txHash', txHash);
  });

programCommand('makeBid')
  .description('make bid to an auction')
  .requiredOption('-tam, --token-account-mint <string>', 'NFT token mint address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .requiredOption('-p, --price <string>', 'price in token decimals')
  .action(async (name, cmd) => {
    const { keypair, env, tokenAccountMint, treasuryMint, rpcUrl, shopCreator, price, version, isEnterpriseArg } =
      cmd.opts();

    const wallet = loadKey(keypair);

    const candyShopProgramId = version === 'v1' ? CANDY_SHOP_PROGRAM_ID : CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const tokenAccount = await findAssociatedTokenAddress(
      new anchor.web3.PublicKey(wallet.publicKey),
      new anchor.web3.PublicKey(tokenAccountMint)
    );

    const txHash = await candyShop.bidAuction({
      tokenAccount: tokenAccount,
      tokenMint: new anchor.web3.PublicKey(tokenAccountMint),
      wallet,
      bidPrice: new anchor.BN(price)
    });

    console.log('txHash', txHash);
  });

programCommand('withdrawBid')
  .description('withdraw bid to an auction')
  .requiredOption('-tam, --token-account-mint <string>', 'NFT token mint address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .action(async (name, cmd) => {
    const { keypair, env, tokenAccountMint, treasuryMint, rpcUrl, shopCreator, version, isEnterpriseArg } = cmd.opts();

    const wallet = loadKey(keypair);
    const candyShopProgramId = version === 'v1' ? CANDY_SHOP_PROGRAM_ID : CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const tokenAccount = await findAssociatedTokenAddress(
      new anchor.web3.PublicKey(wallet.publicKey),
      new anchor.web3.PublicKey(tokenAccountMint)
    );

    const txHash = await candyShop.withdrawAuctionBid({
      tokenAccount: tokenAccount,
      tokenMint: new anchor.web3.PublicKey(tokenAccountMint),
      wallet
    });

    console.log('txHash', txHash);
  });

programCommand('buyNow')
  .description('end auction by buying nft immediately')
  .requiredOption('-tam, --token-account-mint <string>', 'NFT token mint address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .action(async (name, cmd) => {
    const { keypair, env, tokenAccountMint, treasuryMint, rpcUrl, shopCreator, version, isEnterpriseArg } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShopProgramId = version === 'v1' ? CANDY_SHOP_PROGRAM_ID : CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const tokenAccount = await findAssociatedTokenAddress(
      new anchor.web3.PublicKey(wallet.publicKey),
      new anchor.web3.PublicKey(tokenAccountMint)
    );

    const txHash = await candyShop.buyNowAuction({
      tokenAccount: tokenAccount,
      tokenMint: new anchor.web3.PublicKey(tokenAccountMint),
      wallet
    });

    console.log('txHash', txHash);
  });

programCommand('settleAndDistribute')
  .description('settle an auction and distribute the proceeds')
  .requiredOption('-tam, --token-account-mint <string>', 'NFT token mint address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .action(async (name, cmd) => {
    const { keypair, env, tokenAccountMint, treasuryMint, rpcUrl, shopCreator, version, isEnterpriseArg } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShopProgramId = version === 'v1' ? CANDY_SHOP_PROGRAM_ID : CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const tokenAccount = await findAssociatedTokenAddress(
      new anchor.web3.PublicKey(wallet.publicKey),
      new anchor.web3.PublicKey(tokenAccountMint)
    );

    const txHash = await candyShop.settleAndDistributeAuctionProceeds({
      tokenAccount: tokenAccount,
      tokenMint: new anchor.web3.PublicKey(tokenAccountMint),
      wallet
    });

    console.log('txHash', txHash);
  });

programCommand('commitEditionDropNft')
  .description('commit a master edition NFT for edition drop')
  .requiredOption('-ota, --nft-owner-token-account <string>', 'NFT token account address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .requiredOption('-p, --price <string>', 'price in token decimals')
  .requiredOption('-st, --start-time <string>', 'Start Time, unix timestamp')
  .requiredOption('-sp, --sales-period <string>', 'Sales period, unix timestamp')
  .option('-wtm, --whitelist-mint <string>', 'whitelist mint')
  .option('-wtt, --whitelist-time <string>', 'whitelist time, unix timestamp')

  .action(async (name, cmd) => {
    const {
      keypair,
      env,
      nftOwnerTokenAccount,
      treasuryMint,
      rpcUrl,
      shopCreator,
      price,
      startTime,
      salesPeriod,
      whitelistMint,
      whitelistTime,
      version,
      isEnterpriseArg
    } = cmd.opts();

    const wallet = loadKey(keypair);

    if (version !== 'v2') {
      throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }

    // default to v2
    const candyShopProgramId = CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const tokenAccountInfo = await getAccount(candyShop.connection, new PublicKey(nftOwnerTokenAccount), 'finalized');

    const txHash = await candyShop.commitMasterNft({
      nftOwnerTokenAccount: new anchor.web3.PublicKey(nftOwnerTokenAccount),
      masterMint: tokenAccountInfo.mint,
      nftOwner: wallet,
      price: new anchor.BN(price),
      startTime: new anchor.BN(startTime),
      salesPeriod: new anchor.BN(salesPeriod),
      whitelistMint: whitelistMint ? new anchor.web3.PublicKey(whitelistMint) : undefined,
      whitelistTime: whitelistTime ? new anchor.BN(whitelistTime) : undefined
    });

    console.log('txHash', txHash);
  });

programCommand('mintPrint')
  .description('mint an editioned NFT from the master edition')
  .requiredOption('-ota, --nft-owner-token-account <string>', 'NFT token account address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .option('-wtm, --whitelist-mint <string>', 'whitelist mint')

  .action(async (name, cmd) => {
    const {
      keypair,
      env,
      nftOwnerTokenAccount,
      treasuryMint,
      whitelistMint,
      rpcUrl,
      shopCreator,
      version,
      isEnterpriseArg
    } = cmd.opts();
    const wallet = loadKey(keypair);

    if (version !== 'v2') {
      throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }

    // default to v2
    const candyShopProgramId = CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const tokenAccountInfo = await getAccount(candyShop.connection, new PublicKey(nftOwnerTokenAccount), 'finalized');

    const txHash = await candyShop.mintNewPrint({
      nftOwnerTokenAccount: new PublicKey(nftOwnerTokenAccount),
      masterMint: tokenAccountInfo.mint,
      whitelistMint: whitelistMint ? new PublicKey(whitelistMint) : undefined,
      editionBuyer: wallet
    });

    console.log('txHash', txHash);
  });

programCommand('mintAllPrint')
  .description('mint an editioned NFT from the master edition')
  .requiredOption('-ota, --nft-owner-token-account <string>', 'NFT token account address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .option('-wtm, --whitelist-mint <string>', 'whitelist mint')
  .option('-fop, --file-output-path <string>', 'Mint Edition NFT PublicKey Array')
  .action(async (name, cmd) => {
    const {
      keypair,
      env,
      nftOwnerTokenAccount,
      treasuryMint,
      whitelistMint,
      rpcUrl,
      shopCreator,
      version,
      isEnterpriseArg,
      fileOutputPath
    } = cmd.opts();
    const wallet = loadKey(keypair);

    if (version !== 'v2') {
      throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }

    // default to v2
    const candyShopProgramId = CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const tokenAccountInfo = await getAccount(candyShop.connection, new PublicKey(nftOwnerTokenAccount), 'finalized');

    const [vaultAccount] = await getEditionVaultAccount(
      new PublicKey(candyShop.candyShopAddress),
      new PublicKey(nftOwnerTokenAccount)
    );

    const availableEditionNumbers = await getAvailableEditionNumbers(vaultAccount, candyShop.connection);

    const [auctionHouseAuthority] = await getAuctionHouseAuthority(
      new PublicKey(candyShop.candyShopCreatorAddress),
      new PublicKey(candyShop.treasuryMint),
      new PublicKey(candyShop.programId)
    );
    const [auctionHouse] = await getAuctionHouse(auctionHouseAuthority, new PublicKey(candyShop.treasuryMint));

    const newEditions = await Promise.allSettled(
      availableEditionNumbers.map(async (mintEditionNumber, i) => {
        // delay for each mint in case of node rate limit
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve('ok');
          }, i * 2000);
        });

        const { instructions, newEditionMint, newEditionTokenAccount } = await createNewMintInstructions(
          wallet.publicKey,
          candyShop.connection
        );

        const txHash = await CandyShopDrop.mintPrint({
          candyShop: new PublicKey(candyShop.candyShopAddress),
          nftOwnerTokenAccount: new PublicKey(nftOwnerTokenAccount),
          masterMint: tokenAccountInfo.mint,
          whitelistMint,
          editionBuyer: wallet,
          auctionHouse,
          isEnterprise: candyShop.isEnterprise,
          connection: candyShop.connection,
          candyShopProgram: candyShop.getStaticProgram(wallet),
          treasuryMint: new PublicKey(candyShop.treasuryMint),
          mintEditionNumber,
          instructions,
          newEditionMint,
          newEditionTokenAccount
        });

        console.log('Minted:: txHash: ' + txHash + ',editionMint: ' + newEditionMint.publicKey.toString());

        return {
          txHash,
          editionMint: newEditionMint.publicKey.toString()
        };
      })
    );

    if (fileOutputPath) {
      console.log('fileOutputPath: ', fileOutputPath);
      const newEditionMintTokenArray = newEditions
        .filter(
          (result): result is PromiseFulfilledResult<{ txHash: string; editionMint: string }> =>
            result.status === 'fulfilled'
        )
        .map((result) => result.value.editionMint);

      fs.writeFile(fileOutputPath, JSON.stringify(newEditionMintTokenArray), (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  });

programCommand('redeemDrop')
  .description('reclaim nft from edition vault before sale start')
  .requiredOption('-ota, --nft-owner-token-account <string>', 'NFT token account address')
  .requiredOption('-mem, --master-edition-mint <string>', 'NFT master edition mint address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .action(async (name, cmd) => {
    const {
      keypair,
      env,
      nftOwnerTokenAccount,
      masterEditionMint,
      treasuryMint,
      rpcUrl,
      shopCreator,
      version,
      isEnterpriseArg
    } = cmd.opts();
    const wallet = loadKey(keypair);

    if (version !== 'v2') {
      throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }

    // default to v2
    const candyShopProgramId = CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const txHash = await candyShop.redeemDrop({
      nftOwner: wallet,
      nftOwnerTokenAccount: new PublicKey(nftOwnerTokenAccount),
      masterMint: new PublicKey(masterEditionMint)
    });

    console.log('txHash', txHash);
  });

programCommand('updateEditionVault')
  .description('update parameters of edition vault sale')
  .requiredOption('-ota, --nft-owner-token-account <string>', 'NFT token account address')
  .requiredOption('-mem, --master-edition-mint <string>', 'NFT master edition mint address')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .requiredOption('-np, --new-price <string>', 'Updated edition sale price')
  .action(async (name, cmd) => {
    const {
      keypair,
      env,
      nftOwnerTokenAccount,
      masterEditionMint,
      treasuryMint,
      newPrice,
      rpcUrl,
      shopCreator,
      version,
      isEnterpriseArg
    } = cmd.opts();
    const wallet = loadKey(keypair);

    if (version !== 'v2') {
      throw new CandyShopError(CandyShopErrorType.IncorrectProgramId);
    }

    // default to v2
    const candyShopProgramId = CANDY_SHOP_V2_PROGRAM_ID;

    const candyShop = await CandyShop.initSolCandyShop({
      shopCreatorAddress: shopCreator,
      treasuryMint,
      programId: candyShopProgramId.toString(),
      env,
      settings: {
        connectionUrl: rpcUrl
      },
      isEnterprise: isEnterprise(isEnterpriseArg)
    });

    const txHash = await candyShop.updateEditionVault({
      nftOwner: wallet,
      nftOwnerTokenAccount: new PublicKey(nftOwnerTokenAccount),
      masterMint: new PublicKey(masterEditionMint),
      newPrice: new anchor.BN(newPrice)
    });

    console.log('txHash', txHash);
  });

CMD.parse(process.argv);
