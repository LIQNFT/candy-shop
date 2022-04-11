import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

import { AUCTION_HOUSE_PROGRAM_ID } from '../constants';
import {
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseTreasuryAcct,
  getCandyShop,
} from '../utils';

export async function candyStoreWithdrawFromTreasury(
  walletKeyPair: anchor.web3.Keypair,
  treasuryMint: anchor.web3.PublicKey,
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

  const [treasuryAccount] = await getAuctionHouseTreasuryAcct(auctionHouse);

  await program.rpc.candyShopWithdrawFromTreasury(
    amount,
    candyShopBump,
    authorityBump,
    {
      accounts: {
        candyShop,
        candyShopCreator: walletKeyPair.publicKey,
        candyShopCreatorTokenAccount: walletKeyPair.publicKey,
        treasuryMint,
        authority: auctionHouseAuthority,
        treasuryWithdrawalDestination: auctionHouseAuthority,
        auctionHouseTreasury: treasuryAccount,
        auctionHouse: auctionHouse,
        ahProgram: AUCTION_HOUSE_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    }
  );

  console.log('Withdrew from treasury!');
}
