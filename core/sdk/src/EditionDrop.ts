import { Program, Provider } from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, Keypair } from "@solana/web3.js";
import { getNodeWallet, getEditionVaultAccount } from "./vendor";
import editionDropIdl from './idl/edition_drop.json';
import { EDITION_DROP_PROGRAM_ID } from "./factory/constants";
import { CommitNftParams, MintPrintParams, enterpriseCommitNft, enterpriseMintPrint, commitNft, mintPrint } from "./factory/program";
import { EditionDropCommitNftParams, EditionDropMintPrintParams } from ".";

export abstract class EditionDrop {
  static getProgram(connection: Connection, wallet: AnchorWallet | Keypair) {
    const options = Provider.defaultOptions();
    const provider = new Provider(
      connection,
      // check the instance type
      wallet instanceof Keypair ? getNodeWallet(wallet) : wallet,
      options
    );

    // @ts-ignore
    return new Program(editionDropIdl, EDITION_DROP_PROGRAM_ID, provider);
  }

  static async commitNft(params: EditionDropCommitNftParams) {
    const {
      isEnterprise,
      connection,
      candyShop,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      nftOwner,
      price,
      startTime,
      salesPeriod,
      whitelistTime,
      candyShopProgram,
    } = params;

    const [vaultAccount] = await getEditionVaultAccount(candyShop, nftOwnerTokenAccount);

    const commitNftParams: CommitNftParams = {
      candyShop,
      vaultAccount,
      nftOwner,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      whitelistTime,
      price,
      startTime,
      salesPeriod,
      program: this.getProgram(connection, nftOwner),
      candyShopProgram,      
    };

    let txHash: string;

    if (isEnterprise) {
      txHash = await enterpriseCommitNft(commitNftParams)
    } else {
      txHash = await commitNft(commitNftParams);
    }

    return txHash;
  }

  static async mintPrint(params: EditionDropMintPrintParams) {
    const {
      isEnterprise,
      connection,
      candyShop,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      editionBuyer,
      newEditionMint,
      editionNumber,
      newEidtionNftOwnerTokenAccount,
      auctionHouse,
      candyShopProgram,
    } = params;

    const [vaultAccount] = await getEditionVaultAccount(candyShop, nftOwnerTokenAccount);


    const mintPrintParams: MintPrintParams = {
      candyShop,
      vaultAccount,
      nftOwnerTokenAccount,
      masterMint,
      whitelistMint,
      editionBuyer,
      newEditionMint,
      newEidtionNftOwnerTokenAccount,
      auctionHouse,
      editionNumber,
      program: this.getProgram(connection, editionBuyer)
    };

    let txHash: string;

    if (isEnterprise) {
      txHash = await enterpriseMintPrint({ ...mintPrintParams, candyShopProgram })
    } else {
      txHash = await mintPrint(mintPrintParams);
    }

    return txHash;
  }
}