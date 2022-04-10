import * as anchor from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import {
  AUCTION_HOUSE_PROGRAM_ID,
  LIQNFT_TREASURY_ACCOUNT,
  WRAPPED_SOL_MINT,
} from '../constants';
import {
  getAtaForMint,
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseTreasuryAcct,
  getCandyShop,
} from '../utils';

export async function candyStoreWithdrawFromTreasury(
  walletKeyPair: Keypair,
  treasuryMint: PublicKey,
  amount: anchor.BN,
  program: anchor.Program
) {
  const [auctionHouseAuthority, authorityBump] = await getAuctionHouseAuthority(
    walletKeyPair.publicKey,
    treasuryMint,
    program.programId
  );

  const [candyShop, candyShopBump] = await getCandyShop(
    walletKeyPair.publicKey,
    treasuryMint,
    program.programId
  );

  const [auctionHouse] = await getAuctionHouse(
    auctionHouseAuthority,
    treasuryMint
  );

  const isNative = treasuryMint.equals(WRAPPED_SOL_MINT);

  const treasuryWithdrawalDestination = isNative
    ? auctionHouseAuthority
    : (await getAtaForMint(treasuryMint, auctionHouseAuthority))[0];

  const candyShopCreatorTokenAccount = isNative
    ? auctionHouseAuthority
    : (await getAtaForMint(treasuryMint, walletKeyPair.publicKey))[0];

  const [treasuryAccount] = await getAuctionHouseTreasuryAcct(auctionHouse);

  const liqnftTreasuryTokenAccount = isNative
    ? LIQNFT_TREASURY_ACCOUNT
    : (await getAtaForMint(treasuryMint, LIQNFT_TREASURY_ACCOUNT))[0];

  await program.rpc.candyShopWithdrawFromTreasury(
    amount,
    candyShopBump,
    authorityBump,
    {
      accounts: {
        candyShop,
        candyShopCreator: walletKeyPair.publicKey,
        candyShopCreatorTokenAccount,
        liqnftTreasuryAccount: LIQNFT_TREASURY_ACCOUNT,
        liqnftTreasuryTokenAccount,
        treasuryMint,
        authority: auctionHouseAuthority,
        treasuryWithdrawalDestination,
        auctionHouseTreasury: treasuryAccount,
        auctionHouse: auctionHouse,
        ahProgram: AUCTION_HOUSE_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      },
    }
  );

  console.log('Withdrew from treasury!');
}
