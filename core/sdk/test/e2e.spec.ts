import { AnchorError, BN, web3 } from '@project-serum/anchor';
import { CandyShop } from '../src/CandyShop';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
// 81nKpQT3rWpWw3NzdThR6zKN5gfF6mQ2J2BQYxoSDmoq
const USER_1 = new Uint8Array([
  204, 63, 56, 180, 214, 13, 187, 253, 122, 98, 229, 241, 24, 137, 217, 242, 66,
  44, 51, 77, 243, 55, 16, 113, 253, 53, 90, 51, 160, 71, 38, 117, 104, 53, 14,
  150, 198, 212, 155, 135, 224, 249, 12, 216, 117, 111, 245, 128, 107, 186, 158,
  115, 31, 146, 179, 46, 226, 107, 149, 199, 222, 69, 228, 60
]);

// 2NBrMENxrGA8sfSRiXxw1ZXL15Jh2WMf8rH23yYxCi5S
const USER_2 = new Uint8Array([
  110, 144, 2, 84, 20, 29, 153, 28, 98, 173, 70, 40, 240, 194, 154, 88, 44, 141,
  14, 38, 90, 155, 138, 51, 205, 95, 129, 200, 22, 46, 242, 223, 20, 73, 39, 43,
  43, 167, 166, 229, 241, 69, 221, 36, 20, 160, 245, 89, 215, 178, 240, 64, 189,
  137, 126, 10, 196, 254, 86, 7, 48, 2, 152, 77
]);

const CREATOR_ADDRESS = new web3.PublicKey(
  'Fo2cXie4UwreZi7LHMpnsyVPvzuo4FMwAVbSUYQsmbsh'
);
const TREASURY_MINT = new web3.PublicKey(
  'So11111111111111111111111111111111111111112'
);
const CANDY_SHOP_PROGRAM_ID = new web3.PublicKey(
  'csa8JpYfKSZajP7JzxnJipUL3qagub1z29hLvp578iN'
);

const TOKEN_ACCOUNT = new web3.PublicKey(
  'g7orvPEmE2ohKmWPe8YLL4mHCMmhUPg9ikcUsQRH6nf'
);

const TOKEN_MINT = new web3.PublicKey(
  'cZk2AVKbNWdNqZJxbsx85Pb1trQtWhADvqfn8AqEL25'
);

const PRICE = new BN('100000000');

describe('e2e flow', function () {
  let user1: web3.Keypair, user2: web3.Keypair;

  before(async function () {
    user1 = web3.Keypair.fromSecretKey(USER_1);
    user2 = web3.Keypair.fromSecretKey(USER_2);
  });

  it('sell -> cancel -> sell -> buy', async function () {
    this.timeout(20000);

    const candyShop = new CandyShop(
      CREATOR_ADDRESS,
      TREASURY_MINT,
      CANDY_SHOP_PROGRAM_ID,
      'devnet'
    );

    const sellTxHash = await candyShop.sell(
      TOKEN_ACCOUNT,
      TOKEN_MINT,
      PRICE,
      user1
    );
    console.log('sellTxHash ', sellTxHash);

    const cancelTxHash = await candyShop.cancel(
      TOKEN_ACCOUNT,
      TOKEN_MINT,
      PRICE,
      user1
    );
    console.log('cancelTxHash ', cancelTxHash);

    const sellTxHash2 = await candyShop.sell(
      TOKEN_ACCOUNT,
      TOKEN_MINT,
      PRICE,
      user1
    );
    console.log('sellTxHash2 ', sellTxHash2);

    const buyTxHash = await candyShop.buy(
      user1.publicKey,
      TOKEN_ACCOUNT,
      TOKEN_MINT,
      PRICE,
      user2
    );
    console.log('buyTxHash ', buyTxHash);

    const user1Ata = await getAssociatedTokenAddress(
      TOKEN_MINT,
      user1.publicKey
    );
    const user2Ata = await getAssociatedTokenAddress(
      TOKEN_MINT,
      user2.publicKey
    );

    const instructions = [
      createTransferInstruction(user2Ata, user1Ata, user2.publicKey, 1)
    ];
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
    const transaction = new web3.Transaction().add(...instructions);
    transaction.feePayer = user2.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash('finalized')
    ).blockhash;
    transaction.sign(user2);

    const txHash = await connection.sendRawTransaction(
      transaction.serialize(),
      { skipPreflight: true }
    );
    console.log('return NFT txHash', txHash);
  });
});
