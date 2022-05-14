import { CandyShop } from '@liqnft/candy-shop-sdk';
import * as anchor from '@project-serum/anchor';
import { Command } from 'commander';
import { CANDY_SHOP_PROGRAM_ID, loadKey, loadTokenAccountMints, findAssociatedTokenAddress } from './helper/account';

const CMD = new Command();

function programCommand(name: string) {
  return CMD.command(name)
    .requiredOption(
      '-e, --env <string>',
      'Solana cluster env name',
      'devnet' //mainnet-beta, testnet, devnet
    )
    .requiredOption('-k, --keypair <path>', `Solana wallet location`, '--keypair not provided');
}

programCommand('sellMany')
  .requiredOption('-tam, --token-account-mint-list <path>')
  .requiredOption('-tm, --treasury-mint <string>')
  .requiredOption('-sc, --shop-creator <string>')
  .requiredOption('-p, --price <string>')
  .action(async (name, cmd) => {
    console.log(name);

    let { keypair, env, tokenAccountMintList, treasuryMint, price, shopCreator } = cmd.opts();

    let wallet = loadKey(keypair);

    const candyShop = new CandyShop(
      new anchor.web3.PublicKey(shopCreator),
      new anchor.web3.PublicKey(treasuryMint),
      CANDY_SHOP_PROGRAM_ID,
      env
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
  .requiredOption('-tam, --token-account-mint-list <path>')
  .requiredOption('-tm, --treasury-mint <string>')
  .requiredOption('-sc, --shop-creator <string>')
  .requiredOption('-p, --price <string>')
  .action(async (name, cmd) => {
    console.log(name);

    let { keypair, env, tokenAccountMintList, treasuryMint, price, shopCreator } = cmd.opts();

    let wallet = loadKey(keypair);

    const candyShop = new CandyShop(
      new anchor.web3.PublicKey(shopCreator),
      new anchor.web3.PublicKey(treasuryMint),
      CANDY_SHOP_PROGRAM_ID,
      env
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
  .requiredOption('-tam, --token-account-mint <string>')
  .requiredOption('-tm, --treasury-mint <string>')
  .requiredOption('-sc, --shop-creator <string>')
  .requiredOption('-p, --price <string>')
  .action(async (name, cmd) => {
    console.log(name);

    let { keypair, env, tokenAccountMint, treasuryMint, price, shopCreator } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShop = new CandyShop(
      new anchor.web3.PublicKey(shopCreator),
      new anchor.web3.PublicKey(treasuryMint),
      CANDY_SHOP_PROGRAM_ID,
      env
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
  .requiredOption('-tam, --token-account-mint <string>')
  .requiredOption('-tm, --treasury-mint <string>')
  .requiredOption('-sc, --shop-creator <string>')
  .requiredOption('-p, --price <string>')
  .action(async (name, cmd) => {
    console.log(name);

    let { keypair, env, tokenAccountMint, treasuryMint, price, shopCreator } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShop = new CandyShop(
      new anchor.web3.PublicKey(shopCreator),
      new anchor.web3.PublicKey(treasuryMint),
      CANDY_SHOP_PROGRAM_ID,
      env
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
  .requiredOption('-s, --seller <string>')
  .requiredOption('-ta, --token-account <string>')
  .requiredOption('-tam, --token-account-mint <string>')
  .requiredOption('-tm, --treasury-mint <string>')
  .requiredOption('-sc, --shop-creator <string>')
  .requiredOption('-p, --price <string>')
  .action(async (name, cmd) => {
    console.log(name);

    let { keypair, env, seller, tokenAccount, tokenAccountMint, treasuryMint, shopCreator, price } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShop = new CandyShop(
      new anchor.web3.PublicKey(shopCreator),
      new anchor.web3.PublicKey(treasuryMint),
      CANDY_SHOP_PROGRAM_ID,
      env
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
