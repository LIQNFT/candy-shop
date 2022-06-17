import * as anchor from '@project-serum/anchor';
import { web3 } from '@project-serum/anchor';
import {
  AUCTION_HOUSE_PROGRAM_ID,
  BuyAndExecuteSaleTransactionParams,
  checkDelegateOnReceiptAccounts,
  checkNftAvailability,
  checkPaymentAccountBalance,
  compileAtaCreationIxs,
  getAtaForMint,
  getAuctionHouseEscrow,
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState,
  insBuyAndExecuteSale,
  sendTx,
  treasuryMintIsNative
} from '../../..';
import { CandyShopVersion } from '../../../../CandyShopModel';
import { CandyShopError, CandyShopErrorType, Metadata, parseMetadata } from '../../../../utils';

export async function buyAndExecuteSale(params: BuyAndExecuteSaleTransactionParams) {
  const {
    wallet,
    counterParty,
    tokenAccount,
    tokenAccountMint,
    treasuryMint,
    auctionHouseTreasury,
    metadata,
    authority,
    auctionHouse,
    feeAccount,
    candyShop,
    price,
    amount,
    program
  } = params;

  if (counterParty.toString() === wallet.publicKey.toString()) {
    throw new CandyShopError(CandyShopErrorType.BuyerOwnsListing);
  }

  const [buyerEscrow, buyerEscrowBump] = await getAuctionHouseEscrow(auctionHouse, wallet.publicKey);

  const [buyTradeState, buyTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    wallet.publicKey,
    tokenAccount,
    treasuryMint,
    tokenAccountMint,
    amount,
    price
  );

  const isNative = treasuryMintIsNative(treasuryMint);

  const [sellTradeState, sellTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    counterParty,
    tokenAccount,
    treasuryMint,
    tokenAccountMint,
    amount,
    price
  );

  const [freeTradeState, freeTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    counterParty,
    tokenAccount,
    treasuryMint,
    tokenAccountMint,
    amount,
    new anchor.BN(0)
  );
  const [programAsSigner, programAsSignerBump] = await getAuctionHouseProgramAsSigner();

  const transaction = new web3.Transaction();

  const paymentAccount = isNative ? wallet.publicKey : (await getAtaForMint(treasuryMint, wallet.publicKey))[0];

  await checkPaymentAccountBalance(program.provider.connection, paymentAccount, isNative, price.toNumber());

  await checkNftAvailability(
    program.provider.connection,
    tokenAccount,
    sellTradeState,
    sellTradeStateBump,
    amount.toNumber()
  );

  const ix = await program.methods
    .buyWithProxy(price, amount, buyTradeStateBump, buyerEscrowBump)
    .accounts({
      wallet: wallet.publicKey,
      paymentAccount,
      transferAuthority: wallet.publicKey,
      treasuryMint,
      tokenAccount,
      metadata,
      escrowPaymentAccount: buyerEscrow,
      authority,
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      buyerTradeState: buyTradeState,
      candyShop,
      ahProgram: AUCTION_HOUSE_PROGRAM_ID
    })
    .instruction();

  const metadataObj = await program.provider.connection.getAccountInfo(metadata);

  if (!metadataObj?.data) {
    throw new Error(CandyShopErrorType.InvalidNFTMetadata);
  }

  const metadataDecoded: Metadata = parseMetadata(Buffer.from(metadataObj.data));

  const remainingAccounts = [] as Array<{
    pubkey: web3.PublicKey;
    isWritable: boolean;
    isSigner: boolean;
  }>;

  const accountsRequireAta = [] as Array<web3.PublicKey>;

  if (metadataDecoded && metadataDecoded.data && metadataDecoded.data.creators) {
    for (let creator of metadataDecoded.data.creators) {
      const creatorPublicKey = new anchor.web3.PublicKey(creator.address);

      remainingAccounts.push({
        pubkey: creatorPublicKey,
        isWritable: true,
        isSigner: false
      });

      if (!isNative) {
        const ataAddress = (await getAtaForMint(treasuryMint, creatorPublicKey))[0];
        remainingAccounts.push({
          pubkey: ataAddress,
          isWritable: true,
          isSigner: false
        });
        accountsRequireAta.push(creatorPublicKey);
      }
    }
  }

  const sellerPaymentReceiptAccount = isNative ? counterParty : (await getAtaForMint(treasuryMint, counterParty))[0];

  if (!isNative) {
    accountsRequireAta.push(counterParty);
  }

  const allAtaIxs: web3.TransactionInstruction[] = [];

  const treasuyMintAtaIxs = await compileAtaCreationIxs(wallet.publicKey, accountsRequireAta, treasuryMint, program);
  if (treasuyMintAtaIxs) {
    allAtaIxs.push(...treasuyMintAtaIxs);
  }

  const buyerReceiptTokenAccount = (await getAtaForMint(tokenAccountMint, wallet.publicKey))[0];

  // for SOL as treausy shop we dont need this, as the ix has enough budget to complete execution
  // but use for non-SOL as treasury shop to save the execution budget of executeSaleWithProxy
  if (!isNative) {
    const tokenMintAtaIxs = await compileAtaCreationIxs(
      wallet.publicKey,
      [wallet.publicKey],
      tokenAccountMint,
      program
    );
    if (tokenMintAtaIxs) {
      allAtaIxs.push(...tokenMintAtaIxs);
    }

    await checkDelegateOnReceiptAccounts(
      program.provider.connection,
      sellerPaymentReceiptAccount,
      buyerReceiptTokenAccount
    );
  }

  const ix2 = await program.methods
    .executeSaleWithProxy(price, amount, buyerEscrowBump, freeTradeStateBump, programAsSignerBump, true)
    .accounts({
      buyer: wallet.publicKey,
      seller: counterParty,
      tokenAccount,
      tokenMint: tokenAccountMint,
      metadata,
      treasuryMint,
      escrowPaymentAccount: buyerEscrow,
      sellerPaymentReceiptAccount,
      buyerReceiptTokenAccount,
      authority,
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      auctionHouseTreasury,
      buyerTradeState: buyTradeState,
      sellerTradeState: sellTradeState,
      freeTradeState: freeTradeState,
      candyShop,
      ahProgram: AUCTION_HOUSE_PROGRAM_ID,
      programAsSigner: programAsSigner
    })
    .remainingAccounts(remainingAccounts)
    .instruction();

  transaction.add(ix);
  transaction.add(ix2);

  if (allAtaIxs.length > 0) {
    const ataCreationTx = new web3.Transaction();
    ataCreationTx.add(...allAtaIxs);
    const atasCreationTx = await sendTx(wallet, ataCreationTx, program);
    console.log('atasCreationTx', atasCreationTx);
  }

  const buyAndExecuteTx = await sendTx(wallet, transaction, program);
  console.log('buyAndExecuteTx', buyAndExecuteTx);

  console.log('sale executed');
  return buyAndExecuteTx;
}

/**
 * Get tx hash from different executions
 *
 * @param {boolean} isEnterprise
 * @param {BuyAndExecuteSaleTransactionParams} params required params for buy/sell transaction
 */
export function buyAndExecuteSales(
  isEnterprise: boolean,
  callParams: {
    params: BuyAndExecuteSaleTransactionParams;
    version: CandyShopVersion;
    v1Func: (params: any) => Promise<string>;
    v2Func: (params: any) => Promise<string>;
  }
): Promise<string> {
  const { params, version, v1Func, v2Func } = callParams;

  if (isEnterprise) {
    return insBuyAndExecuteSale(params);
  }
  return call(params, version, v1Func, v2Func);
}

/**
 * Chooses to call either v1 or v2 version of passed fuction based on candy shop version
 *
 * @param {any} params argument to the function to call
 * @param {CandyShopVersion} version version of the candy shop
 * @param {function} v1Func function to call if using v1 candy shop
 * @param {function} v2Func function to call if using v1 candy shop
 */
// Please feel free to come up with better name :)
export function call(
  params: any,
  version: CandyShopVersion,
  v1Func: (params: any) => Promise<string>,
  v2Func: (params: any) => Promise<string>
): Promise<string> {
  if (version === CandyShopVersion.V1) {
    return v1Func(params);
  } else {
    return v2Func(params);
  }
}
