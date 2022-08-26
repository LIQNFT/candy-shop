import { BN, Idl, Program, Provider, web3 } from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import {
  AUCTION,
  AUCTION_HOUSE,
  AUCTION_HOUSE_PROGRAM_ID,
  AUTHORITY,
  BID,
  CANDY_SHOP_V2_PROGRAM_ID,
  CANDY_STORE,
  EDITION_DROP,
  EDITION_DROP_PROGRAM_ID,
  EDITION_MARKER_BIT_SIZE,
  FEE_PAYER,
  TOKEN_METADATA_PROGRAM_ID,
  TREASURY,
  WALLET,
  WRAPPED_SOL_MINT
} from '../../factory/constants';

import { CandyShopVersion } from '../../shop/base/BaseShopModel';
import candyShopIdl from '../../idl/candy_shop.json';
import candyShopV2Idl from '../../idl/candy_shop_v2.json';
import { CandyShopError, CandyShopErrorType } from '../error';
import { Creator, Metadata, parseMetadata } from '../token/parseData';
import { safeAwait } from './promiseUtils';
import { awaitTransactionSignatureConfirmation } from './transactionUtils';

/**
 * Get NodeWallet from specified keypair
 *
 * @param {Keypair} wallet keypair wallet will be created for
 * @returns
 */
export const getNodeWallet = (wallet: web3.Keypair) => {
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

export const getEditionVaultAccount = (candyShop: web3.PublicKey, masterTokenAccount: web3.PublicKey) => {
  return web3.PublicKey.findProgramAddress(
    [candyShop.toBuffer(), Buffer.from(EDITION_DROP), masterTokenAccount.toBuffer()],
    EDITION_DROP_PROGRAM_ID
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
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), tokenMint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  );
};

export const getMasterEditionAccount = (tokenMint: web3.PublicKey) => {
  return web3.PublicKey.findProgramAddress(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), tokenMint.toBuffer(), Buffer.from('edition')],
    TOKEN_METADATA_PROGRAM_ID
  );
};

export const getEditionMarkAccount = (tokenMint: web3.PublicKey, edition: number) => {
  const editionNumber = Math.floor(edition / EDITION_MARKER_BIT_SIZE);
  return web3.PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      tokenMint.toBuffer(),
      Buffer.from('edition'),
      Buffer.from(editionNumber.toString())
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
};

export const getSignedTx = (
  wallet: AnchorWallet | web3.Keypair,
  transaction: web3.Transaction,
  extraSigners?: web3.Keypair[]
) => {
  if ('signTransaction' in wallet) {
    if (extraSigners) {
      const extraKeypairs = extraSigners.map((signer) => {
        return {
          publicKey: signer.publicKey,
          secretKey: signer.secretKey
        };
      });
      transaction.sign(...extraKeypairs);
    }

    const signedTx = wallet.signTransaction(transaction);

    return signedTx;
  }

  let signers: web3.Signer[] = [
    {
      publicKey: wallet.publicKey,
      secretKey: wallet.secretKey
    }
  ];

  if (extraSigners) {
    const extraKeypairs = extraSigners.map((signer) => {
      return {
        publicKey: signer.publicKey,
        secretKey: signer.secretKey
      };
    });

    signers.push(...extraKeypairs);
  }

  transaction.sign(...signers);
  return transaction;
};

export const getCandyShopData = async (candyShop: web3.PublicKey, isEnterprise: boolean, program: Program) => {
  const candyShopData = await (isEnterprise
    ? safeAwait(program.account.enterpriseCandyShopV1.fetch(candyShop))
    : safeAwait(program.account.candyShopV1.fetch(candyShop)));

  if (candyShopData.error) {
    throw candyShopData.error;
  }

  if (!candyShopData) {
    throw new CandyShopError(CandyShopErrorType.CandyShopDoesNotExist);
  }

  return candyShopData.result;
};

export const getEditionVaultData = async (vaultAccount: web3.PublicKey, program: Program) => {
  const vaultData = await safeAwait(program.account.vaultAccount.fetch(vaultAccount));

  if (!vaultData) {
    throw new CandyShopError(CandyShopErrorType.VaultDoesNotExist);
  }

  if (vaultData.error) {
    throw vaultData.error;
  }

  return vaultData.result;
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
  addresses: string[],
  mint: web3.PublicKey,
  program: Program
): Promise<web3.TransactionInstruction[] | null> => {
  const ix: web3.TransactionInstruction[] = [];
  for (const addr of addresses) {
    const addrPubKey = new web3.PublicKey(addr);
    const ataAddress = (await getAtaForMint(mint, addrPubKey))[0];

    const ataAccountRes = await safeAwait(getAccount(program.provider.connection, ataAddress));

    const ataAccount = ataAccountRes.result;

    if (!ataAccount || !ataAccount.isInitialized) {
      ix.push(
        createAssociatedTokenAccountInstruction(
          payer,
          ataAddress,
          addrPubKey,
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
  program: Program,
  extraSigners?: web3.Keypair[]
): Promise<string> => {
  const recentBlockhash = await program.provider.connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = recentBlockhash.blockhash;
  transaction.feePayer = wallet.publicKey;
  const signedTx = await getSignedTx(wallet, transaction, extraSigners);
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
