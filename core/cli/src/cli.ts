import { CandyShop } from '@liqnft/candy-shop-sdk';
import * as anchor from '@project-serum/anchor';
import { Command } from 'commander';
import { CANDY_SHOP_PROGRAM_ID, loadKey, loadTokenAccountMints, findAssociatedTokenAddress } from './helper/account';

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
    .requiredOption('-k, --keypair <path>', 'path to Solana wallet keypair');
}

programCommand('sellMany')
  .description('list many NFTs for sale')
  .requiredOption('-tam, --token-account-mint-list <path>', 'path to JSON file with array of NFT token mint addresses')
  .requiredOption('-tm, --treasury-mint <string>', 'Candy Shop treasury mint')
  .requiredOption('-sc, --shop-creator <string>', 'Candy Shop creator address')
  .requiredOption('-p, --price <string>', 'price in token decimals')
  .action(async (name, cmd) => {
    console.log(name);

    let { keypair, env, tokenAccountMintList, treasuryMint, price, shopCreator, rpcUrl } = cmd.opts();

    let wallet = loadKey(keypair);

    const candyShop = new CandyShop(
      new anchor.web3.PublicKey(shopCreator),
      new anchor.web3.PublicKey(treasuryMint),
      CANDY_SHOP_PROGRAM_ID,
      env,
      {
        mainnetConnectionUrl: rpcUrl
      }
    );

    let tokenMints = loadTokenAccountMints(tokenAccountMintList);

    tokenMints.forEach(async (tokenMint) => {
      let tokenAccount = await findAssociatedTokenAddress(
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
    console.log(name);

    let { keypair, env, tokenAccountMintList, treasuryMint, price, shopCreator, rpcUrl } = cmd.opts();

    let wallet = loadKey(keypair);

    const candyShop = new CandyShop(
      new anchor.web3.PublicKey(shopCreator),
      new anchor.web3.PublicKey(treasuryMint),
      CANDY_SHOP_PROGRAM_ID,
      env,
      {
        mainnetConnectionUrl: rpcUrl
      }
    );

    let tokenMints = loadTokenAccountMints(tokenAccountMintList);

    tokenMints.forEach(async (tokenMint) => {
      let tokenAccount = await findAssociatedTokenAddress(
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
    console.log(name);

    let { keypair, env, tokenAccountMint, treasuryMint, price, shopCreator, rpcUrl } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShop = new CandyShop(
      new anchor.web3.PublicKey(shopCreator),
      new anchor.web3.PublicKey(treasuryMint),
      CANDY_SHOP_PROGRAM_ID,
      env,
      {
        mainnetConnectionUrl: rpcUrl
      }
    );

    let tokenAccount = await findAssociatedTokenAddress(
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
    console.log(name);

    let { keypair, env, tokenAccountMint, treasuryMint, price, shopCreator, rpcUrl } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShop = new CandyShop(
      new anchor.web3.PublicKey(shopCreator),
      new anchor.web3.PublicKey(treasuryMint),
      CANDY_SHOP_PROGRAM_ID,
      env,
      {
        mainnetConnectionUrl: rpcUrl
      }
    );

    let tokenAccount = await findAssociatedTokenAddress(
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
    console.log(name);

    let { keypair, env, seller, tokenAccount, tokenAccountMint, treasuryMint, shopCreator, price, rpcUrl } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShop = new CandyShop(
      new anchor.web3.PublicKey(shopCreator),
      new anchor.web3.PublicKey(treasuryMint),
      CANDY_SHOP_PROGRAM_ID,
      env,
      {
        mainnetConnectionUrl: rpcUrl
      }
    );

    const txHash = await candyShop.buy({
      seller: new anchor.web3.PublicKey(seller),
      tokenAccount: new anchor.web3.PublicKey(tokenAccount),
      tokenMint: new anchor.web3.PublicKey(tokenAccountMint),
      price: new anchor.BN(price),
      wallet
    });

    console.log('txHash', txHash);
  });

CMD.parse(process.argv);
