import { web3, BN, Program, Idl, IdlTypes } from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import {
  AUCTION,
  AUCTION_HOUSE,
  WRAPPED_SOL_MINT,
  AUCTION_HOUSE_PROGRAM_ID,
  AUTHORITY,
  BID,
  CANDY_STORE,
  FEE_PAYER,
  TREASURY,
  WALLET
} from './constants';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { CandyShopError, CandyShopErrorType } from '../utils/error';
import { Creator, Metadata, parseMetadata, safeAwait } from '../utils';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { awaitTransactionSignatureConfirmation } from './program';
import { FEE_ACCOUNT_MIN_BAL } from '.';

const METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
const metadataProgramId = new web3.PublicKey(METADATA_PROGRAM_ID);

export const getAuction = (candyShop: web3.PublicKey, mint: web3.PublicKey, marketProgramId: web3.PublicKey) => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION), candyShop.toBuffer(), mint.toBuffer()],
    marketProgramId
  );
};

export const getBid = (auction: web3.PublicKey, wallet: web3.PublicKey, marketProgramId: web3.PublicKey) => {
  return web3.PublicKey.findProgramAddress([Buffer.from(BID), auction.toBuffer(), wallet.toBuffer()], marketProgramId);
};

export const getBidWallet = (auction: web3.PublicKey, wallet: web3.PublicKey, marketProgramId: web3.PublicKey) => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(BID), auction.toBuffer(), wallet.toBuffer(), Buffer.from(WALLET)],
    marketProgramId
  );
};

export const getAuctionHouse = (
  authority: web3.PublicKey,
  treasuryMint: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), authority.toBuffer(), treasuryMint.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseAuthority = (
  creator: web3.PublicKey,
  treasuryMint: web3.PublicKey,
  marketProgramId: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(CANDY_STORE), creator.toBuffer(), treasuryMint.toBuffer(), Buffer.from(AUTHORITY)],
    marketProgramId
  );
};

export const getCandyShop = (
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

export const getAuctionHouseTradeState = (
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

export const getAuctionHouseFeeAcct = (auctionHouse: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), Buffer.from(FEE_PAYER)],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseTreasuryAcct = (auctionHouse: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), Buffer.from(TREASURY)],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseEscrow = (
  auctionHouse: web3.PublicKey,
  wallet: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), wallet.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAtaForMint = (mint: web3.PublicKey, buyer: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
};

export const getMetadataAccount = (tokenMint: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from('metadata'), metadataProgramId.toBuffer(), tokenMint.toBuffer()],
    metadataProgramId
  );
};

export const getSignedTx = (wallet: AnchorWallet | web3.Keypair, transaction: web3.Transaction) => {
  if ('signTransaction' in wallet) {
    return wallet.signTransaction(transaction);
  }
  transaction.sign({
    publicKey: wallet.publicKey,
    secretKey: wallet.secretKey
  });
  return transaction;
};

export const checkTradeStateExist = async (
  connection: web3.Connection,
  sellTradeState: web3.PublicKey,
  sellTradeStateBump: number
) => {
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
) => {
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

export const getAuctionData = async (auction: web3.PublicKey, program: Program) => {
  const auctionData = await safeAwait(program.account.auctionV1.fetch(auction));

  if (auctionData.error) {
    throw auctionData.error;
  }

  if (!auctionData) {
    throw new CandyShopError(CandyShopErrorType.AuctionDoesNotExist);
  }

  return auctionData.result;
};

export const getBidData = async (bid: web3.PublicKey, program: Program) => {
  const bidData = await safeAwait(program.account.bid.fetch(bid));

  if (bidData.error) {
    throw bidData.error;
  }

  if (!bidData) {
    throw new CandyShopError(CandyShopErrorType.BidDoesNotExist);
  }

  return bidData.result;
};

export const checkCreationParams = (startTime: BN, startingBid: BN, buyNowPrice: BN | null, tickSize: BN) => {
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

export const treasuryMintIsNative = (treasuryMint: web3.PublicKey) => {
  return treasuryMint.equals(WRAPPED_SOL_MINT);
};

export const checkIfBidExists = async (bid: web3.PublicKey, connection: web3.Connection) => {
  const bidAccount = await connection.getAccountInfo(bid);
  if (bidAccount !== null) return true;
  return false;
};

export const getNftCreators = async (metadata: web3.PublicKey, connection: web3.Connection) => {
  const metadataObj = await connection.getAccountInfo(metadata);

  if (!metadataObj?.data) {
    throw new Error(CandyShopErrorType.InvalidNFTMetadata);
  }

  const metadataDecoded: Metadata = parseMetadata(Buffer.from(metadataObj.data));

  if (!metadataDecoded || !metadataDecoded.data || !metadataDecoded.data.creators) {
    throw new Error(CandyShopErrorType.InvalidNFTMetadata);
  }

  return metadataDecoded.data.creators;
};

export const getRemainigAccountsForExecuteSaleIx = async (
  metadata: web3.PublicKey,
  connection: web3.Connection,
  treasuryMint: web3.PublicKey,
  isNative: boolean
) => {
  const creators: Creator[] = await getNftCreators(metadata, connection);

  const remainingAccounts = isNative
    ? creators.map((c) => {
        return {
          pubkey: new web3.PublicKey(c.address),
          isWritable: true,
          isSigner: false
        };
      })
    : (
        await Promise.all(
          creators.map(async (c) => {
            const key = new web3.PublicKey(c.address);
            const ataAddress = (await getAtaForMint(treasuryMint, key))[0];

            return [
              {
                pubkey: key,
                isWritable: true,
                isSigner: false
              },
              {
                pubkey: ataAddress,
                isWritable: true,
                isSigner: false
              }
            ];
          })
        )
      ).flat();

  return remainingAccounts;
};

export const checkAHFeeAccountBalance = async (feeAccount: web3.PublicKey, connection: web3.Connection) => {
  const feeAccountInfo = await connection.getAccountInfo(feeAccount);
  if (!feeAccountInfo || feeAccountInfo.lamports < FEE_ACCOUNT_MIN_BAL) {
    throw new CandyShopError(CandyShopErrorType.InsufficientFeeAccountBalance);
  }
};
