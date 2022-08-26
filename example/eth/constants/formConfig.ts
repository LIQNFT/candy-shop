import { CREATOR_ADDRESS, TREASURY_MINT } from './shopParams';
import { chains } from './chains';

export const ETH_LS_CANDY_FORM = 'ETH_LS_CANDY_FORM';

export const ETH_DEFAULT_FORM_CONFIG = {
  creatorAddress: CREATOR_ADDRESS,
  treasuryMint: TREASURY_MINT,
  network: chains.polygonMumbai.network,
  settings: JSON.stringify({
    mainnetConnectionUrl: 'https://mainnet.infura.io/v3/1cb569b43fef47e9b1f13dfa7090a935'
  }),
  paymentProvider: JSON.stringify({
    stripePublicKey: ''
  })
};
