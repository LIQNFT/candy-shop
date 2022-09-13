import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { CANDY_SHOP_V2_PROGRAM_ID, CREATOR_ADDRESS, TREASURY_MINT } from './publicKey';

export const LS_CANDY_FORM = 'LS_CANDY_FORM';

export const DEFAULT_CANDY_FORM = {
  creatorAddress: CREATOR_ADDRESS,
  treasuryMint: TREASURY_MINT,
  programId: CANDY_SHOP_V2_PROGRAM_ID,
  network: WalletAdapterNetwork.Devnet,
  settings: JSON.stringify({
    mainnetConnectionUrl: 'https://ssc-dao.genesysgo.net/'
  })
};
