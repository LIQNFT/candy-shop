import { web3, BN, Program } from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import { AUCTION_HOUSE, AUCTION_HOUSE_PROGRAM_ID, AUTHORITY, CANDY_STORE, FEE_PAYER, TREASURY } from './constants';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { CandyShopError, CandyShopErrorType } from '../utils/error';
import { safeAwait } from '../utils';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { awaitTransactionSignatureConfirmation } from '.';

const METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
const metadataProgramId = new web3.PublicKey(METADATA_PROGRAM_ID);

export const getAuctionHouse = async (
  authority: web3.PublicKey,
  treasuryMint: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), authority.toBuffer(), treasuryMint.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseAuthority = async (
  creator: web3.PublicKey,
  treasuryMint: web3.PublicKey,
  marketProgramId: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(CANDY_STORE), creator.toBuffer(), treasuryMint.toBuffer(), Buffer.from(AUTHORITY)],
    marketProgramId
  );
};

export const getCandyShop = async (
  creator: web3.PublicKey,
  treasuryMint: web3.PublicKey,
  marketProgramId: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(CANDY_STORE), creator.toBuffer(), treasuryMint.toBuffer()],
    marketProgramId
  );
};

export const getCandyShopSync = (
  creator: web3.PublicKey,
  treasuryMint: web3.PublicKey,
  marketProgramId: web3.PublicKey
): [web3.PublicKey, number] => {
  return findProgramAddressSync(
    [Buffer.from(CANDY_STORE), creator.toBuffer(), treasuryMint.toBuffer()],
    marketProgramId
  );
};

export const getAuctionHouseProgramAsSigner = (): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), Buffer.from('signer')],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseTradeState = async (
  auctionHouse: web3.PublicKey,
  wallet: web3.PublicKey,
  tokenAccount: web3.PublicKey,
  treasuryMint: web3.PublicKey,
  tokenMint: web3.PublicKey,
  tokenSize: BN,
  buyPrice: BN
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [
      Buffer.from(AUCTION_HOUSE),
      wallet.toBuffer(),
      auctionHouse.toBuffer(),
      tokenAccount.toBuffer(),
      treasuryMint.toBuffer(),
      tokenMint.toBuffer(),
      buyPrice.toArrayLike(Buffer, 'le', 8),
      tokenSize.toArrayLike(Buffer, 'le', 8)
    ],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseFeeAcct = async (auctionHouse: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), Buffer.from(FEE_PAYER)],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseTreasuryAcct = async (auctionHouse: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), Buffer.from(TREASURY)],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseEscrow = async (
  auctionHouse: web3.PublicKey,
  wallet: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), wallet.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAtaForMint = async (mint: web3.PublicKey, buyer: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
};

export const getMetadataAccount = async (tokenMint: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from('metadata'), metadataProgramId.toBuffer(), tokenMint.toBuffer()],
    metadataProgramId
  );
};

export const getSignedTx = async (wallet: AnchorWallet | web3.Keypair, transaction: web3.Transaction) => {
  if ('signTransaction' in wallet) {
    return wallet.signTransaction(transaction);
  }
  transaction.sign({
    publicKey: wallet.publicKey,
    secretKey: wallet.secretKey
  });
  return transaction;
};

export const checkNftAvailability = async (
  connection: web3.Connection,
  tokenAccount: web3.PublicKey,
  sellTradeState: web3.PublicKey,
  sellTradeStateBump: number,
  amount: number
) => {
  const [programAsSigner] = await getAuctionHouseProgramAsSigner();
  const tokenAccountInfo = await getAccount(connection, tokenAccount);
  const sellTradeStateInfo = await connection.getAccountInfo(sellTradeState);

  if (
    !tokenAccountInfo.delegate ||
    tokenAccountInfo.delegate.toString() !== programAsSigner.toString() ||
    Number(tokenAccountInfo.amount) < amount ||
    sellTradeStateInfo?.data[0] != sellTradeStateBump
  ) {
    throw new CandyShopError(CandyShopErrorType.NFTUnavailable);
  }
};

export const checkPaymentAccountBalance = async (
  connection: web3.Connection,
  paymentAccount: web3.PublicKey,
  isNative: boolean,
  price: number
) => {
  // If isNative = true then payment account = calling user's pubkey
  // i.e. connection.getAccountInfo(paymentAccount) will not return null
  let paymentAccountBalance: number | undefined;

  if (isNative) {
    const info = await connection.getAccountInfo(paymentAccount);
    paymentAccountBalance = info?.lamports;
  } else {
    const accountBalance = await safeAwait(connection.getTokenAccountBalance(paymentAccount));

    if (accountBalance.error) {
      console.log('checkPaymentAccountBalance: getTokenAccountBalance error= ', accountBalance.error);
      paymentAccountBalance = undefined;
    } else {
      paymentAccountBalance = accountBalance.result;
    }
  }

  if (!paymentAccountBalance || paymentAccountBalance < price) {
    throw new CandyShopError(CandyShopErrorType.InsufficientBalance);
  }
};

export const checkDelegateOnReceiptAccounts = async (
  connection: web3.Connection,
  sellerPaymentReceiptAccount: web3.PublicKey,
  buyerReceiptTokenAccount: web3.PublicKey
) => {
  const sellerPaymentReceiptAccountInfo = await getAccount(connection, sellerPaymentReceiptAccount);
  const buyerReceiptTokenAccountInfo = await getAccount(connection, buyerReceiptTokenAccount);

  if (sellerPaymentReceiptAccountInfo.delegate !== null) {
    throw new CandyShopError(CandyShopErrorType.SellerATACannotHaveDelegate);
  }

  if (buyerReceiptTokenAccountInfo.delegate !== null) {
    throw new CandyShopError(CandyShopErrorType.BuyerATACannotHaveDelegate);
  }
};

export const compileAtaCreationIxs = async (
  payer: web3.PublicKey,
  addresses: web3.PublicKey[],
  mint: web3.PublicKey,
  program: Program
): Promise<web3.TransactionInstruction[] | null> => {
  const ix: web3.TransactionInstruction[] = [];
  for (const addr of addresses) {
    const ataAddress = (await getAtaForMint(mint, new web3.PublicKey(addr)))[0];

    const ataAccountRes = await safeAwait(getAccount(program.provider.connection, ataAddress));

    const ataAccount = ataAccountRes.result;

    if (!ataAccount || !ataAccount.isInitialized) {
      ix.push(
        createAssociatedTokenAccountInstruction(
          payer,
          ataAddress,
          addr,
          mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }
  }
  return ix;
};

export const sendTx = async (
  wallet: AnchorWallet | web3.Keypair,
  transaction: web3.Transaction,
  program: Program
): Promise<string> => {
  const recentBlockhash = await program.provider.connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = recentBlockhash.blockhash;
  transaction.feePayer = wallet.publicKey;

  const signedTx = await getSignedTx(wallet, transaction);

  const txHash = await awaitTransactionSignatureConfirmation(program.provider.connection, signedTx.serialize());

  return txHash;
};
