import { CREATOR_ADDRESS, PROGRAM_ID, TREASURY_MINT } from './shopParams';
import { chains } from './chains';

export const ETH_LS_CANDY_FORM = 'ETH_LS_CANDY_FORM';

export const ETH_DEFAULT_FORM_CONFIG = {
  creatorAddress: CREATOR_ADDRESS,
  treasuryMint: TREASURY_MINT,
  programId: PROGRAM_ID,
  network: chains.polygonMumbai.network,
  settings: JSON.stringify({}),
  paymentProvider: JSON.stringify({
    stripePublicKey: ''
  })
};
