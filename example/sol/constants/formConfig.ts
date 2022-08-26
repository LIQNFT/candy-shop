import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { CANDY_SHOP_V2_PROGRAM_ID, CREATOR_ADDRESS, TREASURY_MINT } from './publicKey';

export const LS_CANDY_FORM = 'LS_CANDY_FORM';

export const DEFAULT_FORM_CONFIG = {
  creatorAddress: CREATOR_ADDRESS,
  treasuryMint: TREASURY_MINT,
  programId: CANDY_SHOP_V2_PROGRAM_ID,
  network: WalletAdapterNetwork.Devnet,
  settings: JSON.stringify(
    {
      mainnetConnectionUrl: 'https://api.mainnet-beta.solana.com',
      currencySymbol: 'SOL',
      currencyDecimals: 9
    },
    null,
    2
  ),
  paymentProvider: JSON.stringify(
    {
      stripePublicKey: ''
    },
    null,
    2
  )
};
