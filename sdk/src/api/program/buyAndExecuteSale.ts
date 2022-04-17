import * as anchor from '@project-serum/anchor';
import { Idl, Program, web3 } from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Metadata, parseMetadata } from '../../utils/parseData';
import { AUCTION_HOUSE_PROGRAM_ID, WRAPPED_SOL_MINT } from '../constants';
import {
  getAtaForMint,
  getAuctionHouseEscrow,
  getAuctionHouseProgramAsSigner,
  getAuctionHouseTradeState,
} from '../utils';
import { awaitTransactionSignatureConfirmation } from './submitTx';

export async function buyAndExecuteSale(
  wallet: AnchorWallet | web3.Keypair,
  counterParty: web3.PublicKey,
  tokenAccount: web3.PublicKey,
  tokenAccountMint: web3.PublicKey,
  treasuryMint: web3.PublicKey,
  auctionHouseTreasury: web3.PublicKey,
  metadata: web3.PublicKey,
  authority: web3.PublicKey,
  authorityBump: number,
  auctionHouse: web3.PublicKey,
  feeAccount: web3.PublicKey,
  candyShop: web3.PublicKey,
  price: anchor.BN,
  amount: anchor.BN,
  program: Program<Idl>
) {
  const [buyerEscrow, buyerEscrowBump] = await getAuctionHouseEscrow(
    auctionHouse,
    wallet.publicKey
  );

  const [buyTradeState, buyTradeStateBump] = await getAuctionHouseTradeState(
    auctionHouse,
    wallet.publicKey,
    tokenAccount,
    treasuryMint,
    tokenAccountMint,
    amount,
    price
  );

  const isNative = treasuryMint.equals(WRAPPED_SOL_MINT);

  const [sellTradeState] = await getAuctionHouseTradeState(
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
  const [programAsSigner, programAsSignerBump] =
    await getAuctionHouseProgramAsSigner();

  const paymentAccount = isNative
    ? wallet.publicKey
    : (await getAtaForMint(treasuryMint, wallet.publicKey))[0];

  const ix = await program.instruction.buyWithProxy(
    price,
    amount,
    buyTradeStateBump,
    buyerEscrowBump,
    authorityBump,
    {
      accounts: {
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
        ahProgram: AUCTION_HOUSE_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
    }
  );

  const metadataObj = await program.provider.connection.getAccountInfo(
    metadata
  );

  if (!metadataObj?.data) {
    throw new Error('failed to get metadata account data');
  }

  const metadataDecoded: Metadata = parseMetadata(
    Buffer.from(metadataObj.data)
  );

  const remainingAccounts = [] as Array<{
    pubkey: web3.PublicKey;
    isWritable: boolean;
    isSigner: boolean;
  }>;

  const accountsRequireAta = new Set() as Set<string>;

  if (metadataDecoded != null) {
    if (metadataDecoded.data && metadataDecoded.data.creators) {
      for (let i = 0; i < metadataDecoded.data.creators.length; i++) {
        const creatorPublicKey = new anchor.web3.PublicKey(
          metadataDecoded.data.creators[i].address
        );
        remainingAccounts.push({
          pubkey: creatorPublicKey,
          isWritable: true,
          isSigner: false,
        });

        if (!isNative) {
          const ataAddress = (
            await getAtaForMint(treasuryMint, creatorPublicKey)
          )[0];
          remainingAccounts.push({
            pubkey: ataAddress,
            isWritable: true,
            isSigner: false,
          });
          accountsRequireAta.add(creatorPublicKey.toString());
        }
      }
    }
  }

  const sellerPaymentReceiptAccount = isNative
    ? counterParty
    : (await getAtaForMint(treasuryMint, counterParty))[0];

  if (!isNative) {
    accountsRequireAta.add(counterParty.toString());
  }

  const allAtaIxs = [];

  const treasuyMintAtaIxs = await compileAtaCreationIxs(
    wallet.publicKey,
    Array.from(accountsRequireAta).map((ata) => new web3.PublicKey(ata)),
    treasuryMint,
    program
  );
  if (treasuyMintAtaIxs) {
    allAtaIxs.push(...treasuyMintAtaIxs);
  }

  const buyerReceiptTokenAccount = (
    await getAtaForMint(tokenAccountMint, wallet.publicKey)
  )[0];

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
  }

  const ix2 = await program.instruction.executeSaleWithProxy(
    price,
    amount,
    buyerEscrowBump,
    freeTradeStateBump,
    programAsSignerBump,
    authorityBump,
    true,
    {
      accounts: {
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
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        programAsSigner: programAsSigner,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
      remainingAccounts,
    }
  );

  if (allAtaIxs.length > 0) {
    const ataCreationTx = new web3.Transaction();
    ataCreationTx.add(...allAtaIxs);
    const atasCreationTx = await sendTx(wallet, ataCreationTx, program);
    console.log('atasCreationTx', atasCreationTx);
  }

  // if creators has too many, separate the buy and executeSales program call
  let buyAndExecuteTx;
  if (remainingAccounts.length > 6) {
    console.log('splitting ixs into 2 txs');
    const buyTransaction = new web3.Transaction();
    buyTransaction.add(ix);
    const buyTx = await sendTx(wallet, buyTransaction, program);
    console.log('buyTx', buyTx);

    const executeSaleTransaction = new web3.Transaction();
    executeSaleTransaction.add(ix2);
    buyAndExecuteTx = await sendTx(wallet, executeSaleTransaction, program);
  } else {
    const transaction = new web3.Transaction();
    transaction.add(ix);
    transaction.add(ix2);
    buyAndExecuteTx = await sendTx(wallet, transaction, program);
  }

  console.log('buyAndExecuteTx', buyAndExecuteTx);
  return buyAndExecuteTx;
}

async function compileAtaCreationIxs(
  payer: web3.PublicKey,
  addresses: web3.PublicKey[],
  mint: web3.PublicKey,
  program: Program
): Promise<web3.TransactionInstruction[] | null> {
  const ix: web3.TransactionInstruction[] = [];
  for (const addr of addresses) {
    const ataAddress = (
      await getAtaForMint(mint, new anchor.web3.PublicKey(addr))
    )[0];

    const ataAccount = await getAccount(
      program.provider.connection,
      ataAddress
    ).catch((err) => {
      console.log('owner', addr.toString());
      console.log('ataAddress', ataAddress.toString());
      console.log('fetch ata error', err);
      return null;
    });
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
}

async function sendTx(
  wallet: AnchorWallet | web3.Keypair,
  transaction: web3.Transaction,
  program: Program
): Promise<string> {
  const recentBlockhash = await program.provider.connection.getLatestBlockhash(
    'finalized'
  );
  transaction.recentBlockhash = recentBlockhash.blockhash;
  transaction.feePayer = wallet.publicKey;

  const signedTx =
    'signTransaction' in wallet
      ? await wallet.signTransaction(transaction)
      : await (async () => {
          await transaction.sign({
            publicKey: wallet.publicKey,
            secretKey: wallet.secretKey,
          });
          return transaction;
        })();
  const txHash = await awaitTransactionSignatureConfirmation(
    program.provider.connection,
    signedTx.serialize()
  );
  return txHash;
}
