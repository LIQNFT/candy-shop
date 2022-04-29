import * as anchor from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount
} from '@solana/spl-token';
import {
  AUCTION_HOUSE,
  AUCTION_HOUSE_PROGRAM_ID,
  AUTHORITY,
  CANDY_STORE,
  FEE_PAYER,
  TREASURY
} from './constants';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { CandyShopError, CandyShopErrorType } from '../utils/error';
import { safeAwait } from '../utils';

const METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
const metadataProgramId = new anchor.web3.PublicKey(METADATA_PROGRAM_ID);

export const getAuctionHouse = async (
  authority: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), authority.toBuffer(), treasuryMint.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseAuthority = async (
  creator: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey,
  marketProgramId: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(CANDY_STORE),
      creator.toBuffer(),
      treasuryMint.toBuffer(),
      Buffer.from(AUTHORITY)
    ],
    marketProgramId
  );
};

export const getCandyShop = async (
  creator: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey,
  marketProgramId: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(CANDY_STORE), creator.toBuffer(), treasuryMint.toBuffer()],
    marketProgramId
  );
};

export const getCandyShopSync = (
  creator: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey,
  marketProgramId: anchor.web3.PublicKey
): [anchor.web3.PublicKey, number] => {
  return findProgramAddressSync(
    [Buffer.from(CANDY_STORE), creator.toBuffer(), treasuryMint.toBuffer()],
    marketProgramId
  );
};

export const getAuctionHouseProgramAsSigner = (): Promise<
  [anchor.web3.PublicKey, number]
> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), Buffer.from('signer')],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseTradeState = async (
  auctionHouse: anchor.web3.PublicKey,
  wallet: anchor.web3.PublicKey,
  tokenAccount: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey,
  tokenMint: anchor.web3.PublicKey,
  tokenSize: anchor.BN,
  buyPrice: anchor.BN
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
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

export const getAuctionHouseFeeAcct = async (
  auctionHouse: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(AUCTION_HOUSE),
      auctionHouse.toBuffer(),
      Buffer.from(FEE_PAYER)
    ],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseTreasuryAcct = async (
  auctionHouse: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(AUCTION_HOUSE),
      auctionHouse.toBuffer(),
      Buffer.from(TREASURY)
    ],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseEscrow = async (
  auctionHouse: anchor.web3.PublicKey,
  wallet: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), wallet.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAtaForMint = async (
  mint: anchor.web3.PublicKey,
  buyer: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
};

export const getMetadataAccount = async (
  tokenMint: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      metadataProgramId.toBuffer(),
      tokenMint.toBuffer()
    ],
    metadataProgramId
  );
};

export const checkNftAvailability = async (
  connection: anchor.web3.Connection,
  tokenAccount: anchor.web3.PublicKey,
  sellTradeState: anchor.web3.PublicKey,
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
  connection: anchor.web3.Connection,
  paymentAccount: anchor.web3.PublicKey,
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
    const accountBalance = await safeAwait(
      connection.getTokenAccountBalance(paymentAccount)
    );

    if (accountBalance.error) {
      console.log(
        'checkPaymentAccountBalance: getTokenAccountBalance error= ',
        accountBalance.error
      );
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
  connection: anchor.web3.Connection,
  sellerPaymentReceiptAccount: anchor.web3.PublicKey,
  buyerReceiptTokenAccount: anchor.web3.PublicKey
) => {
  const sellerPaymentReceiptAccountInfo = await getAccount(
    connection,
    sellerPaymentReceiptAccount
  );
  const buyerReceiptTokenAccountInfo = await getAccount(
    connection,
    buyerReceiptTokenAccount
  );

  if (sellerPaymentReceiptAccountInfo.delegate !== null) {
    throw new CandyShopError(CandyShopErrorType.SellerATACannotHaveDelegate);
  }

  if (buyerReceiptTokenAccountInfo.delegate !== null) {
    throw new CandyShopError(CandyShopErrorType.BuyerATACannotHaveDelegate);
  }
};
