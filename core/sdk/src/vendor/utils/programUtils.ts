import { web3, BN, Program, Idl, Provider } from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import {
  AUCTION,
  AUCTION_HOUSE,
  WRAPPED_SOL_MINT,
  AUCTION_HOUSE_PROGRAM_ID,
  AUTHORITY,
  BID,
  CANDY_STORE,
  FEE_PAYER,
  TREASURY,
  WALLET,
  CANDY_SHOP_V2_PROGRAM_ID
} from '../../factory/constants';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import candyShopIdl from '../../idl/candy_shop.json';
import candyShopV2Idl from '../../idl/candy_shop_v2.json';
import { awaitTransactionSignatureConfirmation } from './transactionUtils';
import { CandyShopError, CandyShopErrorType } from '../error';
import { safeAwait } from './promiseUtils';
import { Creator, Metadata, parseMetadata } from '../token/parseData';
import { CandyShopVersion } from '../../CandyShopModel';

const METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
export const MetadataProgramPubkey = new web3.PublicKey(METADATA_PROGRAM_ID);

/**
 * Get NodeWallet from specified keypair
 *
 * @param {Keypair} wallet keypair wallet will be created for
 * @returns
 */
const getNodeWallet = (wallet: web3.Keypair) => {
  const NodeWallet = require('@project-serum/anchor/dist/cjs/nodewallet').default;
  return new NodeWallet(wallet);
};

export const getCandyShopVersion = (shopProgramId: web3.PublicKey) => {
  return shopProgramId.equals(CANDY_SHOP_V2_PROGRAM_ID) ? CandyShopVersion.V2 : CandyShopVersion.V1;
};

/**
 * Gets anchor Program object for Candy Shop program
 *
 * @param {AnchorWallet | web3.Keypair} wallet Wallet or keypair of connected user
 */
export const getProgram = (
  connection: web3.Connection,
  candyShopProgramId: web3.PublicKey,
  wallet: AnchorWallet | web3.Keypair
): Program<Idl> => {
  const options = Provider.defaultOptions();
  const provider = new Provider(
    connection,
    // check the instance type
    wallet instanceof web3.Keypair ? getNodeWallet(wallet) : wallet,
    options
  );

  const idl = candyShopProgramId.equals(CANDY_SHOP_V2_PROGRAM_ID) ? candyShopV2Idl : candyShopIdl;
  // Directly use the JSON file here temporarily
  // @ts-ignore
  return new Program(idl, candyShopProgramId, provider);
};

export const getAuction = (candyShop: web3.PublicKey, mint: web3.PublicKey, marketProgramId: web3.PublicKey) => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION), candyShop.toBuffer(), mint.toBuffer()],
    marketProgramId
  );
};

export const getBid = (auction: web3.PublicKey, wallet: web3.PublicKey, marketProgramId: web3.PublicKey) => {
  return web3.PublicKey.findProgramAddress([Buffer.from(BID), auction.toBuffer(), wallet.toBuffer()], marketProgramId);
};

export const getBidWallet = (auction: web3.PublicKey, wallet: web3.PublicKey, marketProgramId: web3.PublicKey) => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(BID), auction.toBuffer(), wallet.toBuffer(), Buffer.from(WALLET)],
    marketProgramId
  );
};

export const getAuctionHouse = (
  authority: web3.PublicKey,
  treasuryMint: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), authority.toBuffer(), treasuryMint.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseAuthority = (
  creator: web3.PublicKey,
  treasuryMint: web3.PublicKey,
  marketProgramId: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(CANDY_STORE), creator.toBuffer(), treasuryMint.toBuffer(), Buffer.from(AUTHORITY)],
    marketProgramId
  );
};

export const getCandyShop = (
  creator: web3.PublicKey,
  treasuryMint: web3.PublicKey,
  marketProgramId: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(CANDY_STORE), creator.toBuffer(), treasuryMint.toBuffer()],
    marketProgramId
  );
};

export const getCandyShopSync = (
  creator: web3.PublicKey,
  treasuryMint: web3.PublicKey,
  marketProgramId: web3.PublicKey
): [web3.PublicKey, number] => {
  return findProgramAddressSync(
    [Buffer.from(CANDY_STORE), creator.toBuffer(), treasuryMint.toBuffer()],
    marketProgramId
  );
};

export const getAuctionHouseProgramAsSigner = (): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), Buffer.from('signer')],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseTradeState = (
  auctionHouse: web3.PublicKey,
  wallet: web3.PublicKey,
  tokenAccount: web3.PublicKey,
  treasuryMint: web3.PublicKey,
  tokenMint: web3.PublicKey,
  tokenSize: BN,
  buyPrice: BN
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [
      Buffer.from(AUCTION_HOUSE),
      wallet.toBuffer(),
      auctionHouse.toBuffer(),
      tokenAccount.toBuffer(),
      treasuryMint.toBuffer(),
      tokenMint.toBuffer(),
      buyPrice.toArrayLike(Buffer, 'le', 8),
      tokenSize.toArrayLike(Buffer, 'le', 8)
    ],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseFeeAcct = (auctionHouse: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), Buffer.from(FEE_PAYER)],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseTreasuryAcct = (auctionHouse: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), Buffer.from(TREASURY)],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAuctionHouseEscrow = (
  auctionHouse: web3.PublicKey,
  wallet: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), auctionHouse.toBuffer(), wallet.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );
};

export const getAtaForMint = (mint: web3.PublicKey, buyer: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
};

export const getMetadataAccount = (tokenMint: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from('metadata'), MetadataProgramPubkey.toBuffer(), tokenMint.toBuffer()],
    MetadataProgramPubkey
  );
};

export const getSignedTx = (wallet: AnchorWallet | web3.Keypair, transaction: web3.Transaction) => {
  if ('signTransaction' in wallet) {
    return wallet.signTransaction(transaction);
  }
  transaction.sign({
    publicKey: wallet.publicKey,
    secretKey: wallet.secretKey
  });
  return transaction;
};

export const getAuctionData = async (auction: web3.PublicKey, program: Program) => {
  const auctionData = await safeAwait(program.account.auctionV1.fetch(auction));

  if (auctionData.error) {
    throw auctionData.error;
  }

  if (!auctionData) {
    throw new CandyShopError(CandyShopErrorType.AuctionDoesNotExist);
  }

  return auctionData.result;
};

export const getBidData = async (bid: web3.PublicKey, program: Program) => {
  const bidData = await safeAwait(program.account.bid.fetch(bid));

  if (bidData.error) {
    throw bidData.error;
  }

  if (!bidData) {
    throw new CandyShopError(CandyShopErrorType.BidDoesNotExist);
  }

  return bidData.result;
};

export const compileAtaCreationIxs = async (
  payer: web3.PublicKey,
  addresses: web3.PublicKey[],
  mint: web3.PublicKey,
  program: Program
): Promise<web3.TransactionInstruction[] | null> => {
  const ix: web3.TransactionInstruction[] = [];
  for (const addr of addresses) {
    const ataAddress = (await getAtaForMint(mint, new web3.PublicKey(addr)))[0];

    const ataAccountRes = await safeAwait(getAccount(program.provider.connection, ataAddress));

    const ataAccount = ataAccountRes.result;

    if (!ataAccount || !ataAccount.isInitialized) {
      ix.push(
        createAssociatedTokenAccountInstruction(
          payer,
          ataAddress,
          addr,
          mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }
  }
  return ix;
};

export const sendTx = async (
  wallet: AnchorWallet | web3.Keypair,
  transaction: web3.Transaction,
  program: Program
): Promise<string> => {
  const recentBlockhash = await program.provider.connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = recentBlockhash.blockhash;
  transaction.feePayer = wallet.publicKey;

  const signedTx = await getSignedTx(wallet, transaction);

  const txHash = await awaitTransactionSignatureConfirmation(program.provider.connection, signedTx.serialize());

  return txHash;
};

export const treasuryMintIsNative = (treasuryMint: web3.PublicKey) => {
  return treasuryMint.equals(WRAPPED_SOL_MINT);
};

export const getNftCreators = async (metadata: web3.PublicKey, connection: web3.Connection) => {
  const metadataObj = await connection.getAccountInfo(metadata);

  if (!metadataObj?.data) {
    throw new Error(CandyShopErrorType.InvalidNFTMetadata);
  }

  const metadataDecoded: Metadata = parseMetadata(Buffer.from(metadataObj.data));

  if (!metadataDecoded || !metadataDecoded.data || !metadataDecoded.data.creators) {
    throw new Error(CandyShopErrorType.InvalidNFTMetadata);
  }

  return metadataDecoded.data.creators;
};

export const getRemainingAccountsForExecuteSaleIx = async (
  metadata: web3.PublicKey,
  connection: web3.Connection,
  treasuryMint: web3.PublicKey,
  isNative: boolean
) => {
  const creators: Creator[] = await getNftCreators(metadata, connection);

  const remainingAccounts = isNative
    ? creators.map((c) => {
        return {
          pubkey: new web3.PublicKey(c.address),
          isWritable: true,
          isSigner: false
        };
      })
    : (
        await Promise.all(
          creators.map(async (c) => {
            const key = new web3.PublicKey(c.address);
            const ataAddress = (await getAtaForMint(treasuryMint, key))[0];

            return [
              {
                pubkey: key,
                isWritable: true,
                isSigner: false
              },
              {
                pubkey: ataAddress,
                isWritable: true,
                isSigner: false
              }
            ];
          })
        )
      ).flat();

  return remainingAccounts;
};
