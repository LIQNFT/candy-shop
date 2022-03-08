import { getAccount } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { Metadata, parseEdition, parseMetadata } from "../utils/parseData";
import { safeAwait } from "../utils/PromiseHelper";

const defaultNftImage =
  "https://www.arweave.net/TpkEyWka_H192dTAvCRFgGEdhK9deaxPJ_9FZe7gxj8?ext=jpeg";
const defaultNftAnimation =
  "https://www.arweave.net/wP_6dWvChZHLGg_lVLv-eGCNj4kRa5lkWNDKG1gamRo?ext=mp4";
const defaultNftDescription = "SOME NFT";

const METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
const metadataProgramId = new PublicKey(METADATA_PROGRAM_ID);

export type SingleTokenInfo = {
  tokenAccountAddress: string;
  metadata: Metadata | undefined;
  edition: string | undefined;
  tokenMintAddress: string;
  nftImage: string;
  nftAnimation: string | undefined;
  nftDescription: string;
};

export const singleTokenInfoPromise = async (
  connection: Connection,
  tokenAccountAddress: string
): Promise<SingleTokenInfo> => {

  // Get account 
  const token = await getAccount(
    connection,
    new PublicKey(tokenAccountAddress)
  );
  console.log("singleTokenInfoPromise", token);

  const [newEditionMetadata] = await PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      metadataProgramId.toBuffer(),
      token.mint.toBuffer(),
    ],
    metadataProgramId
  );
  const [newEditionPublicKey] = await PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      metadataProgramId.toBuffer(),
      token.mint.toBuffer(),
      Buffer.from("edition"),
    ],
    metadataProgramId
  );

  const newEditionMetadataAccountInfoResult = await safeAwait(
    connection.getAccountInfo(newEditionMetadata)
  );
  if (newEditionMetadataAccountInfoResult.error) {
    console.log("rate limited");
  }
  const newEditionMetadataAccountInfo =
    newEditionMetadataAccountInfoResult.result;

  const newEditionAccountInfoResult = await safeAwait(
    connection.getAccountInfo(newEditionPublicKey)
  );
  if (newEditionAccountInfoResult.error) {
    console.log("rate limited");
  }
  const newEditionAccountInfo = newEditionAccountInfoResult.result;

  const tokenInfo = newEditionMetadataAccountInfo
    ? parseMetadata(newEditionMetadataAccountInfo.data)
    : undefined;
  const tokenEdition = newEditionAccountInfo
    ? parseEdition(newEditionAccountInfo?.data).edition.toString()
    : undefined;
  console.log("querying uri", tokenInfo!.data.uri);

  let nftImage = defaultNftImage;
  let nftAnimation: string | undefined = defaultNftAnimation;
  let nftDescription = defaultNftDescription;
  try {
    const res = await axios.get(tokenInfo!.data.uri, { timeout: 5000 });
    const nftUriData = res.data as any;
    nftImage = nftUriData.image;
    nftAnimation = nftUriData.animation_url;
    nftDescription = nftUriData.description;
  } catch (e) {
    console.log("failed to get nftUri, using default data");
  }

  return {
    tokenAccountAddress: tokenAccountAddress,
    metadata: tokenInfo,
    edition: tokenEdition,
    tokenMintAddress: token.mint.toString(),
    nftImage,
    nftAnimation,
    nftDescription,
  };
};
