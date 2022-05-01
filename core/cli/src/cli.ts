import { CandyShop } from '@liqnft/candy-shop-sdk';
import * as anchor from '@project-serum/anchor';
import { Command } from 'commander';
import { CANDY_SHOP_PROGRAM_ID, loadKey } from './helper/account';

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

programCommand('sell')
  .requiredOption('-ta, --token-account <string>')
  .requiredOption('-tam, --token-account-mint <string>')
  .requiredOption('-tm, --treasury-mint <string>')
  .requiredOption('-sc, --shop-creator <string>')
  .requiredOption('-p, --price <string>')
  .action(async (name, cmd) => {
    console.log(name);

    let { keypair, env, tokenAccount, tokenAccountMint, treasuryMint, price, shopCreator } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShop = new CandyShop(
      new anchor.web3.PublicKey(shopCreator),
      new anchor.web3.PublicKey(treasuryMint),
      CANDY_SHOP_PROGRAM_ID,
      env
    );

    const txHash = await candyShop.sell(
      new anchor.web3.PublicKey(tokenAccount),
      new anchor.web3.PublicKey(tokenAccountMint),
      new anchor.BN(price),
      wallet
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

    let { keypair, env, tokenAccount, tokenAccountMint, treasuryMint, price, shopCreator } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShop = new CandyShop(
      new anchor.web3.PublicKey(shopCreator),
      new anchor.web3.PublicKey(treasuryMint),
      CANDY_SHOP_PROGRAM_ID,
      env
    );

    const txHash = await candyShop.cancel(
      new anchor.web3.PublicKey(tokenAccount),
      new anchor.web3.PublicKey(tokenAccountMint),
      new anchor.BN(price),
      wallet
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

    let { keypair, env, seller, tokenAccount, tokenAccountMint, treasuryMint, shopCreator, price } = cmd.opts();

    const wallet = loadKey(keypair);

    const candyShop = new CandyShop(
      new anchor.web3.PublicKey(shopCreator),
      new anchor.web3.PublicKey(treasuryMint),
      CANDY_SHOP_PROGRAM_ID,
      env
    );

    const txHash = await candyShop.buy(
      new anchor.web3.PublicKey(seller),
      new anchor.web3.PublicKey(tokenAccount),
      new anchor.web3.PublicKey(tokenAccountMint),
      new anchor.BN(price),
      wallet
    );

    console.log('txHash', txHash);
  });

CMD.parse(process.argv);
