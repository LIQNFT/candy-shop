import { BN, Program, web3 } from '@project-serum/anchor';
import { getAccount } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { getCandyShopData, getEditionVaultData } from '.';
import {
  FEE_ACCOUNT_MIN_BAL,
  NATIVE_AUCTION_CREATORS_LIMIT,
  NATIVE_MARKETPLACE_CREATORS_LIMIT,
  SPL_AUCTION_CREATORS_LIMIT,
  SPL_MARKETPLACE_CREATORS_LIMIT,
  TOKEN_METADATA_PROGRAM_ID,
  WRAPPED_SOL_MINT
} from '../../factory/constants';
import { CandyShopError, CandyShopErrorType } from '../error';
import { parseMasterEditionV2 } from '../token/parseData';
import {
  getAuctionData,
  getAuctionHouseProgramAsSigner,
  getMetadataAccount,
  getNftCreators,
  treasuryMintIsNative
} from './programUtils';
import { safeAwait } from './promiseUtils';

export enum TransactionType {
  Marketplace = 'Marketplace',
  Auction = 'Auction'
}

export const checkTradeStateExist = async (
  connection: web3.Connection,
  sellTradeState: web3.PublicKey,
  sellTradeStateBump: number
): Promise<void> => {
  const sellTradeStateInfo = await connection.getAccountInfo(sellTradeState);
  if (sellTradeStateInfo?.data[0] === sellTradeStateBump) {
    throw new CandyShopError(CandyShopErrorType.TradeStateExists);
  }
};

export const checkNftAvailability = async (
  connection: web3.Connection,
  tokenAccount: web3.PublicKey,
  sellTradeState: web3.PublicKey,
  sellTradeStateBump: number,
  amount: number
): Promise<void> => {
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
): Promise<void> => {
  // If isNative = true then payment account = calling user's pubkey
  // i.e. connection.getAccountInfo(paymentAccount) will not return null
  let paymentAccountBalance: number | undefined | null;

  if (isNative) {
    const info = await connection.getAccountInfo(paymentAccount);
    paymentAccountBalance = info?.lamports;
  } else {
    const accountBalance = await safeAwait(connection.getTokenAccountBalance(paymentAccount));

    if (accountBalance.error) {
      console.log('checkPaymentAccountBalance: getTokenAccountBalance error= ', accountBalance.error);
      paymentAccountBalance = undefined;
    } else {
      paymentAccountBalance = new BN(accountBalance.result.value.amount).toNumber();
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
): Promise<void> => {
  const sellerPaymentReceiptAccountInfoRes = await safeAwait(getAccount(connection, sellerPaymentReceiptAccount));
  const buyerReceiptTokenAccountInfoRes = await safeAwait(getAccount(connection, buyerReceiptTokenAccount));

  const sellerPaymentReceiptAccountInfo = sellerPaymentReceiptAccountInfoRes.result;
  const buyerReceiptTokenAccountInfo = buyerReceiptTokenAccountInfoRes.result;

  if (sellerPaymentReceiptAccountInfo && sellerPaymentReceiptAccountInfo.delegate) {
    throw new CandyShopError(CandyShopErrorType.SellerATACannotHaveDelegate);
  }

  if (buyerReceiptTokenAccountInfo && buyerReceiptTokenAccountInfo.delegate) {
    throw new CandyShopError(CandyShopErrorType.BuyerATACannotHaveDelegate);
  }
};

export const checkCreationParams = (startTime: BN, startingBid: BN, buyNowPrice: BN | null, tickSize: BN): void => {
  if (
    tickSize.lten(0) ||
    startTime.ltn(Date.now() / 1000 - 60) ||
    (buyNowPrice && buyNowPrice.lt(startingBid.add(tickSize)))
  ) {
    throw new CandyShopError(CandyShopErrorType.InvalidAuctionCreationParams);
  }
};

export const checkCanCancel = async (auction: web3.PublicKey, program: Program) => {
  const currentTime = new BN(Date.now() / 1000);
  const auctionData = await getAuctionData(auction, program);
  const auctionEndTime: BN = auctionData.startTime.add(auctionData.biddingPeriod);

  if (
    (currentTime.gt(auctionEndTime) && auctionData.highestBid != null) ||
    (currentTime.gt(auctionData.startTime) && currentTime.lt(auctionEndTime))
  ) {
    throw new CandyShopError(CandyShopErrorType.CannotCancel);
  }
};

export const checkBidPeriod = async (auction: web3.PublicKey, program: Program) => {
  const currentTime = new BN(Date.now() / 1000);
  const auctionData = await getAuctionData(auction, program);
  const auctionEndTime: BN = auctionData.startTime.add(auctionData.biddingPeriod);

  if (currentTime.lt(auctionData.startTime) || currentTime.gt(auctionEndTime)) {
    throw new CandyShopError(CandyShopErrorType.NotWithinBidPeriod);
  }
};

export const checkIfBidExists = async (bid: web3.PublicKey, connection: web3.Connection) => {
  const bidAccount = await connection.getAccountInfo(bid);
  if (bidAccount !== null) return true;
  return false;
};

export const checkBidParams = async (auction: web3.PublicKey, bidPrice: BN, program: Program) => {
  const auctionData = await getAuctionData(auction, program);

  await checkBidPeriod(auction, program);

  if (auctionData.buyNowPrice && bidPrice.gt(auctionData.buyNowPrice)) {
    throw new CandyShopError(CandyShopErrorType.BidTooHigh);
  }

  if (
    (auctionData.highestBid && bidPrice.lt(auctionData.highestBid.price.add(auctionData.tickSize))) ||
    (!auctionData.highestBid && bidPrice.lt(auctionData.startingBid))
  ) {
    throw new CandyShopError(CandyShopErrorType.BidTooLow);
  }
};

export const checkCanWithdraw = async (auction: web3.PublicKey, bid: web3.PublicKey, program: Program) => {
  const auctionData = await getAuctionData(auction, program);

  if (auctionData.highestBid && auctionData.highestBid.key.equals(bid)) {
    throw new CandyShopError(CandyShopErrorType.CannotWithdraw);
  }
};

export const checkBuyNowAvailable = async (auction: web3.PublicKey, program: Program): Promise<BN> => {
  const auctionData = await getAuctionData(auction, program);

  if (!auctionData.buyNowPrice) {
    throw new Error(CandyShopErrorType.BuyNowUnavailable);
  }

  return auctionData.buyNowPrice;
};

export const checkSettleParams = async (auction: web3.PublicKey, program: Program) => {
  const auctionData = await getAuctionData(auction, program);
  const currentTime = new BN(Date.now() / 1000);
  const auctionEndTime: BN = auctionData.startTime.add(auctionData.biddingPeriod);

  if (currentTime.lt(auctionEndTime)) {
    throw new CandyShopError(CandyShopErrorType.AuctionNotOver);
  }

  if (!auctionData.highestBid) {
    throw new Error(CandyShopErrorType.AuctionHasNoBids);
  }
};

export const checkCreators = async (
  treasuryMint: web3.PublicKey,
  nftMint: web3.PublicKey,
  connection: web3.Connection,
  transactionType: TransactionType
) => {
  const isNative = treasuryMintIsNative(treasuryMint);
  const [nftMetadata] = await getMetadataAccount(nftMint);
  const creators = await getNftCreators(nftMetadata, connection);
  const creatorsLimit = getCreatorLimit(isNative, transactionType);

  if (creators.length > creatorsLimit) {
    throw new CandyShopError(CandyShopErrorType.TooManyCreators);
  }
};

export const checkAHFeeAccountBalance = async (feeAccount: web3.PublicKey, connection: web3.Connection) => {
  const feeAccountInfo = await connection.getAccountInfo(feeAccount);
  if (!feeAccountInfo || feeAccountInfo.lamports < FEE_ACCOUNT_MIN_BAL) {
    throw new CandyShopError(CandyShopErrorType.InsufficientFeeAccountBalance);
  }
};

const getCreatorLimit = (isNative: boolean, transactionType: TransactionType) => {
  switch (transactionType) {
    case TransactionType.Marketplace:
      return isNative ? NATIVE_MARKETPLACE_CREATORS_LIMIT : SPL_MARKETPLACE_CREATORS_LIMIT;
    case TransactionType.Auction:
      return isNative ? NATIVE_AUCTION_CREATORS_LIMIT : SPL_AUCTION_CREATORS_LIMIT;
    default:
      throw new CandyShopError(CandyShopErrorType.NotReachable);
  }
};

export const checkCanCommit = async (
  candyShop: PublicKey,
  nftOwner: PublicKey,
  masterMint: PublicKey,
  program: Program
) => {
  await checkDropCommittable(masterMint, program);

  const candyShopData = await getCandyShopData(candyShop, false, program);

  if (!candyShopData.creator.equals(nftOwner)) {
    throw new CandyShopError(CandyShopErrorType.InvalidNftOwner);
  }

  if (!Object.keys(candyShopData.key).includes('candyShopV1')) {
    throw new CandyShopError(CandyShopErrorType.IncorrectCandyShopType);
  }
};

export const checkCanCommitEnterprise = async (candyShop: PublicKey, masterMint: PublicKey, program: Program) => {
  await checkDropCommittable(masterMint, program);

  const candyShopData = await getCandyShopData(candyShop, true, program);

  if (!candyShopData.treasuryMint.equals(WRAPPED_SOL_MINT)) {
    throw new CandyShopError(CandyShopErrorType.InvalidTreasuryMint);
  }

  if (!Object.keys(candyShopData.key).includes('enterpriseCandyShopV1')) {
    throw new CandyShopError(CandyShopErrorType.IncorrectCandyShopType);
  }
};

export const checkEditionMintPeriod = async (vaultAccount: PublicKey, program: Program) => {
  const vaultData = await getEditionVaultData(vaultAccount, program);

  const currentTime: BN = new BN(Date.now() / 1000);
  const saleEndTime: BN = vaultData.startingTime.add(vaultData.salesPeriod);

  if (
    currentTime.lt(vaultData.whitelistTime ?? vaultData.startingTime) ||
    (currentTime.gte(saleEndTime) && !vaultData.salesPeriod.eq(new BN(0)))
  ) {
    throw new CandyShopError(CandyShopErrorType.NotWithinSalesPeriod);
  }
  return vaultData;
};

export const checkRedeemable = async (vaultAccount: PublicKey, program: Program) => {
  const vaultData = await getEditionVaultData(vaultAccount, program);

  if (vaultData.currentSupply.gt(new BN(0))) {
    throw new CandyShopError(CandyShopErrorType.DropNotRedeemable);
  }
};

export const checkDropCommittable = async (masterMint: web3.PublicKey, program: Program) => {
  const maxSupportedEdition = new BN(10_000);
  const [nftEditionPublicKey] = await web3.PublicKey.findProgramAddress(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), masterMint.toBuffer(), Buffer.from('edition')],
    TOKEN_METADATA_PROGRAM_ID
  );

  const nftEditionAccountInfo = await safeAwait(program.provider.connection.getAccountInfo(nftEditionPublicKey));
  if (nftEditionAccountInfo.error) {
    throw new CandyShopError(CandyShopErrorType.FailToFetchOnchainAccount);
  }

  const maxSupply = nftEditionAccountInfo.result
    ? await parseMasterEditionV2(nftEditionAccountInfo.result.data).maxSupply
    : undefined;
  if (maxSupply && maxSupply.gt(maxSupportedEdition)) {
    throw new CandyShopError(CandyShopErrorType.ExceedDropMaxAllowedSupply);
  }
};

export const checkExtensionParams = (extensionPeriod: BN | undefined, extensionIncrement: BN | undefined) => {
  if ((extensionPeriod && !extensionIncrement) || (!extensionPeriod && extensionIncrement)) {
    throw new CandyShopError(CandyShopErrorType.MissingExtensionSetting);
  }

  if (extensionIncrement && extensionPeriod) {
    if (extensionPeriod.gt(extensionIncrement)) {
      throw new CandyShopError(CandyShopErrorType.InvalidExtensionSettings);
    }
  }
};
