import * as anchor from '@project-serum/anchor';
import { Idl, Program, web3 } from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
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
  wallet: AnchorWallet,
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
  const ata = (await getAtaForMint(treasuryMint, wallet.publicKey))[0];

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

  const transaction = new web3.Transaction();

  const ix = await program.instruction.buyWithProxy(
    price,
    amount,
    buyTradeStateBump,
    buyerEscrowBump,
    authorityBump,
    {
      accounts: {
        wallet: wallet.publicKey,
        paymentAccount: isNative ? wallet.publicKey : ata,
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
  const metadataDecoded: Metadata = parseMetadata(
    Buffer.from(metadataObj!.data)
  );

  const remainingAccounts = [] as any;

  if (metadataDecoded != null) {
    for (let i = 0; i < metadataDecoded!.data!.creators!.length; i++) {
      remainingAccounts.push({
        pubkey: new anchor.web3.PublicKey(
          metadataDecoded!.data!.creators![i].address
        ),
        isWritable: true,
        isSigner: false,
      });

      if (!isNative) {
        remainingAccounts.push({
          pubkey: (
            await getAtaForMint(
              treasuryMint,
              new anchor.web3.PublicKey(
                metadataDecoded!.data!.creators![i].address
              )
            )
          )[0],
          isWritable: true,
          isSigner: false,
        });
      }
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
        sellerPaymentReceiptAccount: isNative
          ? counterParty
          : (
              await getAtaForMint(treasuryMint, counterParty)
            )[0],
        buyerReceiptTokenAccount: (
          await getAtaForMint(tokenAccountMint, wallet.publicKey)
        )[0],
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
  transaction.add(ix);
  transaction.add(ix2);

  // add recent blockhash
  const recentBlockhash = await program.provider.connection.getLatestBlockhash(
    'finalized'
  );
  transaction.recentBlockhash = recentBlockhash.blockhash;

  // add fee payer
  transaction.feePayer = wallet.publicKey;

  const signedTx = await wallet.signTransaction(transaction);

  const txHash = await awaitTransactionSignatureConfirmation(
    program.provider.connection,
    signedTx.serialize()
  );

  console.log('sale executed');

  return txHash;
}
