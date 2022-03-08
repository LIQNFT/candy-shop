import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { singleTokenInfoPromise } from './fetchMetadata';

export const fetchNftsFromWallet = async (
  connection: anchor.web3.Connection,
  walletAddress: anchor.web3.PublicKey,
) => {
  let nfts: any = [];
  let metadataPromises: any = [];

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, { programId: TOKEN_PROGRAM_ID });

  console.log('fetchNftsFromWallet: token accounts', tokenAccounts);
  for (let i = 0; i < tokenAccounts.value.length; i++) {
    const tokenAccount = tokenAccounts.value[i];
    const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount;

    const tokenAmountIsOne = tokenAmount.amount === '1' || tokenAmount.amount === 1;
    const tokenDecimalsIsZero = tokenAmount.decimals === '0' || tokenAmount.decimals === 0;

    // fetch metadata for NFTs
    if (tokenAmountIsOne && tokenDecimalsIsZero) {
      let metadataPromise = singleTokenInfoPromise(connection, tokenAccount.pubkey.toString());
      metadataPromises.push(metadataPromise);
    }
  }

  let metadataArray: any = await Promise.allSettled(metadataPromises);

  console.log('fetchNftsFromWallet: NFTs', metadataArray);

  metadataArray.forEach((nft: any) => {
    if (nft.status === 'fulfilled') {
      nfts.push(nft.value);
    }
  });

  return nfts;
}