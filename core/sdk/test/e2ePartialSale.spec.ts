import { Blockchain } from '@liqnft/candy-shop-types';
import { BN, web3 } from '@project-serum/anchor';
import { CandyShop, SolShopInitParams } from '../src/shop/sol/CandyShop';
import { initEnvWithNftHolder, initEnvWithSftHolder } from './utils';
// 4HnGEPFYhYmfes7zug3J1bcYvtDD3MzPqdjhjbjJQk8g
const USER_1 = new Uint8Array([
  216, 182, 60, 250, 155, 92, 144, 67, 192, 235, 161, 201, 146, 102, 19, 103, 124, 11, 159, 2, 146, 23, 165, 154, 227,
  167, 182, 14, 182, 99, 251, 11, 48, 223, 136, 69, 91, 119, 86, 173, 101, 42, 129, 24, 176, 86, 104, 124, 164, 171, 97,
  176, 236, 193, 206, 91, 47, 136, 0, 68, 136, 155, 196, 49
]);

// F2U1L4Mttwg2jJhhJKRDZxsiRAVubzBxaMkcvyhPBRnG
const USER_2 = new Uint8Array([
  101, 249, 41, 179, 109, 218, 47, 52, 202, 143, 76, 216, 29, 46, 231, 118, 221, 250, 230, 255, 204, 232, 216, 110, 42,
  35, 214, 137, 144, 201, 26, 243, 208, 99, 187, 177, 193, 30, 176, 192, 89, 12, 218, 128, 98, 7, 72, 214, 147, 140,
  149, 155, 86, 227, 71, 117, 31, 112, 154, 82, 53, 105, 95, 17
]);

const ENTERPRISE_CREATOR_ADDRESS = new web3.PublicKey('85cps4BnPhoiegGMAtNQioEhEJZnRTpguKoovCWtPTCZ');
const REGULAR_CREATOR_ADDRESS = new web3.PublicKey('4HnGEPFYhYmfes7zug3J1bcYvtDD3MzPqdjhjbjJQk8g');
const TREASURY_MINT = new web3.PublicKey('So11111111111111111111111111111111111111112');
const CANDY_SHOP_PROGRAM_ID = new web3.PublicKey('csbMUULiQfGjT8ezT16EoEBaiarS6VWRevTw1JMydrS');

const PRICE = new BN('100000000');
const AMOUNT = new BN('10');
const PARTIAL_AMOUNT = new BN('5');

describe('e2e partial sale flow', function () {
  const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
  let user1: web3.Keypair, user2: web3.Keypair;

  before(async function () {
    this.timeout(60000);
    user1 = web3.Keypair.fromSecretKey(USER_1);
    user2 = web3.Keypair.fromSecretKey(USER_2);
  });

  it('sell -> partial sale', async function () {
    this.timeout(600000);

    const params: SolShopInitParams = {
      shopCreatorAddress: REGULAR_CREATOR_ADDRESS.toString(),
      treasuryMint: TREASURY_MINT.toString(),
      programId: CANDY_SHOP_PROGRAM_ID.toString(),
      env: Blockchain.SolDevnet,
      settings: undefined,
      isEnterprise: false
    };

    const candyShop = await CandyShop.initSolCandyShop(params);

    const { sftMint, sftOwnerTokenAccount } = await initEnvWithSftHolder(
      user1,
      user1,
      AMOUNT.toNumber(),
      candyShop.connection
    );

    const sellTxHash = await candyShop.sell({
      tokenAccount: sftOwnerTokenAccount,
      tokenMint: sftMint,
      price: PRICE,
      amount: AMOUNT,
      wallet: user1
    });
    console.log('sellTxHash ', sellTxHash);
    await connection.confirmTransaction(sellTxHash);

    const partialBuyTx = await candyShop.buy({
      seller: user1.publicKey,
      tokenAccount: sftOwnerTokenAccount,
      tokenMint: sftMint,
      price: PRICE,
      amount: AMOUNT,
      partialOrderAmount: PARTIAL_AMOUNT,
      wallet: user2
    });
    console.log('partialBuyTx ', partialBuyTx);
  });

  it('sell -> partial sale (enterprise)', async function () {
    this.timeout(60000);

    const params: SolShopInitParams = {
      shopCreatorAddress: ENTERPRISE_CREATOR_ADDRESS.toString(),
      treasuryMint: TREASURY_MINT.toString(),
      programId: CANDY_SHOP_PROGRAM_ID.toString(),
      env: Blockchain.SolDevnet,
      settings: undefined,
      isEnterprise: true
    };

    const candyShop = await CandyShop.initSolCandyShop(params);

    const { sftMint, sftOwnerTokenAccount } = await initEnvWithSftHolder(
      user1,
      user1,
      AMOUNT.toNumber(),
      candyShop.connection
    );

    const sellTxHash = await candyShop.sell({
      tokenAccount: sftOwnerTokenAccount,
      tokenMint: sftMint,
      price: PRICE,
      amount: AMOUNT,
      wallet: user1
    });
    console.log('sellTxHash ', sellTxHash);
    await connection.confirmTransaction(sellTxHash);

    const partialBuyTx = await candyShop.buy({
      seller: user1.publicKey,
      tokenAccount: sftOwnerTokenAccount,
      tokenMint: sftMint,
      price: PRICE,
      amount: AMOUNT,
      partialOrderAmount: PARTIAL_AMOUNT,
      wallet: user2
    });
    console.log('partialBuyTx ', partialBuyTx);
  });
});
