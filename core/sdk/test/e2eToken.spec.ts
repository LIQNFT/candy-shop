import { BN, web3 } from '@project-serum/anchor';
import { approve, createTransferInstruction, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import assert from 'assert';
import { safeAwait } from '../src/utils';
import { CandyShop } from '../src/CandyShop';
// 3NjzSLrnFDwzxJtEzxHUTV5nGYQPHm49EfUFD9fhaDwp
const USER_1 = new Uint8Array([
  244, 102, 110, 130, 157, 96, 75, 224, 32, 248, 104, 240, 164, 91, 228, 165, 32, 19, 15, 202, 76, 68, 120, 129, 49,
  144, 180, 137, 124, 11, 182, 8, 35, 73, 46, 28, 112, 104, 217, 13, 241, 34, 232, 160, 183, 219, 203, 73, 199, 242,
  162, 157, 236, 3, 38, 228, 37, 22, 184, 176, 204, 134, 133, 131
]);

// EYSN35Nrc58Q6TQ59HgdDwfd5gZPTpQCzKPioRMp8VYF
const USER_2 = new Uint8Array([
  242, 85, 131, 168, 217, 101, 94, 89, 96, 5, 204, 241, 15, 20, 240, 226, 176, 227, 147, 144, 218, 208, 21, 108, 47,
  163, 3, 5, 147, 118, 111, 196, 201, 53, 156, 224, 190, 79, 44, 60, 178, 195, 254, 202, 223, 3, 231, 57, 104, 32, 5,
  207, 187, 36, 105, 147, 3, 103, 140, 251, 193, 56, 2, 140
]);

const CREATOR_ADDRESS = new web3.PublicKey('Fo2cXie4UwreZi7LHMpnsyVPvzuo4FMwAVbSUYQsmbsh');
const TREASURY_MINT = new web3.PublicKey('56pdaHboK66cxRLkzkYVvFSAjfoNEETJUsrdmAYaTXMJ');
const CANDY_SHOP_PROGRAM_ID = new web3.PublicKey('csa8JpYfKSZajP7JzxnJipUL3qagub1z29hLvp578iN');

const TOKEN_ACCOUNT = new web3.PublicKey('61VHe9542FD8sFyEL9rDCfVbeXsHyqMkE1EtprviAFw2');

const TOKEN_MINT = new web3.PublicKey('EHiL1dAGMYhEArpGnHqxNKVY4wzHbkR4rtLNW2xaaL9F');

const PRICE = new BN('20');

describe('e2e token flow', function () {
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
      isEnterprise: false
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

  it('revokes seller treasury ata delagate', async function () {
    this.timeout(60000);
    const randomDelegate = web3.Keypair.generate().publicKey;
    const sellerTreasuryAta = await getAssociatedTokenAddress(TREASURY_MINT, user1.publicKey);
    await approve(connection, user1, sellerTreasuryAta, randomDelegate, user1, 1);

    const sellerTreasuryAtaInfo1 = (await safeAwait(getAccount(connection, sellerTreasuryAta))).result;

    assert(
      sellerTreasuryAtaInfo1 &&
        sellerTreasuryAtaInfo1.delegate &&
        sellerTreasuryAtaInfo1.delegate.equals(randomDelegate),
      'Seller treasury mint ata should have delegate.'
    );

    const candyShop = new CandyShop({
      candyShopCreatorAddress: CREATOR_ADDRESS,
      treasuryMint: TREASURY_MINT,
      candyShopProgramId: CANDY_SHOP_PROGRAM_ID,
      env: 'devnet',
      settings: undefined,
      isEnterprise: false
    });

    const sellTxHash = await candyShop.sell({
      tokenAccount: TOKEN_ACCOUNT,
      tokenMint: TOKEN_MINT,
      price: PRICE,
      wallet: user1
    });
    console.log('sellTxHash ', sellTxHash);
    await connection.confirmTransaction(sellTxHash);

    const sellerTreasuryAtaInfo2 = (await safeAwait(getAccount(connection, sellerTreasuryAta))).result;

    assert(
      sellerTreasuryAtaInfo2 && !sellerTreasuryAtaInfo2.delegate,
      'Seller treasury mint ata delegate should have been removed.'
    );

    const cancelTxHash = await candyShop.cancel({
      tokenAccount: TOKEN_ACCOUNT,
      tokenMint: TOKEN_MINT,
      price: PRICE,
      wallet: user1
    });
    console.log('cancelTxHash ', cancelTxHash);
  });
});
