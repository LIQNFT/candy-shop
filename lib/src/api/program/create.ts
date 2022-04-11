import * as anchor from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { AUCTION_HOUSE_PROGRAM_ID, WRAPPED_SOL_MINT } from '../constants';
import {
  getAtaForMint,
  getAuctionHouse,
  getAuctionHouseAuthority,
  getAuctionHouseFeeAcct,
  getAuctionHouseTreasuryAcct,
  getCandyShop,
} from '../utils';

export interface CsKeys {
  auctionHouseAuthority: anchor.web3.PublicKey;
  authorityBump: number;
  auctionHouse: anchor.web3.PublicKey;
  auctionHouseBump: number;
  feeAccount: anchor.web3.PublicKey;
  feeBump: number;
  treasuryAccount: anchor.web3.PublicKey;
  treasuryBump: number;
  candyShop: anchor.web3.PublicKey;
  txHash: string;
}

export async function createAuctionHouse(
  walletKeyPair: anchor.web3.Keypair,
  treasuryMint: anchor.web3.PublicKey,
  sellerFeeBasisPoint: anchor.BN,
  feeSplit: anchor.BN,
  shopName: string,
  program: anchor.Program
): Promise<CsKeys> {
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

  const [auctionHouse, auctionHouseBump] = await getAuctionHouse(
    auctionHouseAuthority,
    treasuryMint
  );

  const treasuryWithdrawalDestination =
    treasuryMint === WRAPPED_SOL_MINT
      ? auctionHouseAuthority
      : (await getAtaForMint(treasuryMint, auctionHouseAuthority))[0];

  const [feeAccount, feeBump] = await getAuctionHouseFeeAcct(auctionHouse);
  const [treasuryAccount, treasuryBump] = await getAuctionHouseTreasuryAcct(
    auctionHouse
  );

  const txHash = await program.rpc.createCandyShop(
    sellerFeeBasisPoint,
    true,
    true,
    auctionHouseBump,
    feeBump,
    treasuryBump,
    candyShopBump,
    feeSplit,
    shopName,
    {
      accounts: {
        treasuryMint,
        payer: walletKeyPair.publicKey,
        authority: auctionHouseAuthority,
        feeWithdrawalDestination: walletKeyPair.publicKey,
        treasuryWithdrawalDestination,
        treasuryWithdrawalDestinationOwner: auctionHouseAuthority,
        auctionHouse,
        auctionHouseFeeAccount: feeAccount,
        auctionHouseTreasury: treasuryAccount,
        candyShop,
        ahProgram: AUCTION_HOUSE_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    }
  );

  console.log('Auction house created!');
  return {
    auctionHouseAuthority,
    authorityBump,
    auctionHouse,
    auctionHouseBump,
    feeAccount,
    feeBump,
    treasuryAccount,
    treasuryBump,
    candyShop,
    txHash,
  };
}
