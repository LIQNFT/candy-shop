import { web3 } from '@project-serum/anchor';
import {
  AUCTION_HOUSE_PROGRAM_ID,
  getAtaForMint,
  getCandyShop,
  sendTx,
  treasuryMintIsNative
} from '../../../../../vendor';
import { UpdateCandyShopParams } from '../../types/shop.type';

export async function updateCandyShop(params: UpdateCandyShopParams) {
  const {
    wallet,
    treasuryMint,
    sellerFeeBasisPoint,
    requiresSignOff,
    canChangeSalePrice,
    split,
    auctionHouse,
    auctionHouseAuthority,
    authorityBump,
    program
  } = params;

  const isNative = treasuryMintIsNative(treasuryMint);

  const [candyShop] = await getCandyShop(wallet.publicKey, treasuryMint, program.programId);

  const treasuryWithdrawalDestination = isNative
    ? auctionHouseAuthority
    : (await getAtaForMint(treasuryMint, auctionHouseAuthority))[0];

  const ix = await program.methods
    .updateCandyShopInfo(sellerFeeBasisPoint, requiresSignOff, canChangeSalePrice, split, authorityBump)
    .accounts({
      treasuryMint,
      wallet: wallet.publicKey,
      candyShopCreator: wallet.publicKey,
      authority: auctionHouseAuthority,
      feeWithdrawalDestination: wallet.publicKey,
      treasuryWithdrawalDestination,
      treasuryWithdrawalDestinationOwner: auctionHouseAuthority,
      auctionHouse,
      candyShop,
      ahProgram: AUCTION_HOUSE_PROGRAM_ID
    })
    .instruction();

  const transaction = new web3.Transaction();
  transaction.add(ix);
  const txId = await sendTx(wallet, transaction, program);
  console.log('updateCandyShopIx', txId);

  console.log('Auction house updated!');

  return txId;
}
