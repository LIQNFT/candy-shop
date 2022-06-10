import { BN, web3 } from '@project-serum/anchor';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { CandyShop } from '../src/CandyShop';
// 3bbErS7dXtoQcMTanAW2f5rDjkxZoKh3TecNof8PPE57
const USER_1 = new Uint8Array([
  105, 212, 70, 238, 216, 174, 173, 43, 146, 250, 108, 44, 80, 102, 255, 65, 132, 80, 42, 191, 12, 85, 146, 191, 225,
  169, 26, 59, 214, 182, 28, 100, 38, 147, 213, 216, 93, 232, 143, 155, 130, 157, 194, 28, 179, 115, 150, 203, 48, 56,
  139, 138, 53, 127, 22, 63, 71, 147, 41, 242, 50, 5, 25, 114
]);

// 9B7ZpTvnNBJs523yyiLaHavQTS3Z6fZ2CgN7bcfJWoE6
const USER_2 = new Uint8Array([
  92, 2, 180, 40, 6, 131, 77, 69, 169, 10, 26, 161, 215, 105, 52, 78, 212, 38, 195, 204, 183, 37, 55, 86, 54, 12, 48,
  140, 209, 164, 78, 235, 121, 116, 186, 62, 79, 199, 166, 183, 230, 198, 230, 55, 43, 52, 129, 251, 65, 71, 110, 18,
  229, 136, 245, 189, 228, 216, 86, 212, 56, 203, 149, 135
]);

// TODO: add creator
const CREATOR_ADDRESS = new web3.PublicKey('B2B2XZpk2a9hvpNBpXYNdZxg3Sy5WJb34wdoDgb5VFJ8');
const TREASURY_MINT = new web3.PublicKey('So11111111111111111111111111111111111111112');
const CANDY_SHOP_PROGRAM_ID = new web3.PublicKey('csbMUULiQfGjT8ezT16EoEBaiarS6VWRevTw1JMydrS');

const TOKEN_ACCOUNT = new web3.PublicKey('Eakkca8Ms9W82uzPyzVRRkSdgRY9rczEaua8rwycu4hq');

const TOKEN_MINT = new web3.PublicKey('6zZmfagbCiuWuZMidxiPsdBTbwqnMbHDUDrfL161LXNd');

const PRICE = new BN('100000000');

describe('e2e sol flow', function () {
  const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
  let user1: web3.Keypair, user2: web3.Keypair;

  before(async function () {
    user1 = web3.Keypair.fromSecretKey(USER_1);
    user2 = web3.Keypair.fromSecretKey(USER_2);
  });

  it('sell -> cancel -> sell -> buy', async function () {
    this.timeout(60000);

    const candyShop = new CandyShop({
      candyShopCreatorAddress: CREATOR_ADDRESS,
      treasuryMint: TREASURY_MINT,
      candyShopProgramId: CANDY_SHOP_PROGRAM_ID,
      env: 'devnet',
      settings: undefined,
      isEnterprise: true
    });

    const sellTxHash = await candyShop.sell({
      tokenAccount: TOKEN_ACCOUNT,
      tokenMint: TOKEN_MINT,
      price: PRICE,
      wallet: user1
    });
    console.log('sellTxHash ', sellTxHash);
    await connection.confirmTransaction(sellTxHash);

    const cancelTxHash = await candyShop.cancel({
      tokenAccount: TOKEN_ACCOUNT,
      tokenMint: TOKEN_MINT,
      price: PRICE,
      wallet: user1
    });
    console.log('cancelTxHash ', cancelTxHash);

    const sellTxHash2 = await candyShop.sell({
      tokenAccount: TOKEN_ACCOUNT,
      tokenMint: TOKEN_MINT,
      price: PRICE,
      wallet: user1
    });
    console.log('sellTxHash2 ', sellTxHash2);

    const buyTxHash = await candyShop.buy({
      seller: user1.publicKey,
      tokenAccount: TOKEN_ACCOUNT,
      tokenMint: TOKEN_MINT,
      price: PRICE,
      wallet: user2
    });
    console.log('buyTxHash ', buyTxHash);

    const user1Ata = await getAssociatedTokenAddress(TOKEN_MINT, user1.publicKey);
    const user2Ata = await getAssociatedTokenAddress(TOKEN_MINT, user2.publicKey);

    const instructions = [createTransferInstruction(user2Ata, user1Ata, user2.publicKey, 1)];
    const transaction = new web3.Transaction().add(...instructions);
    transaction.feePayer = user2.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
    transaction.sign(user2);

    const txHash = await connection.sendRawTransaction(transaction.serialize(), { skipPreflight: true });
    console.log('return NFT txHash', txHash);
  });
});
