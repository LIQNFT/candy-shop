import { WalletMultiButton } from "@solana/wallet-adapter-ant-design";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import React, { FC } from "react";
import { CandyShop, Orders, Sell } from "../.";

export const CandyShopContent: FC = () => {
  const { connection } = useConnection();

  const wallet = useAnchorWallet();

  const candyShop = new CandyShop(
    new PublicKey("Fo2cXie4UwreZi7LHMpnsyVPvzuo4FMwAVbSUYQsmbsh"),
    new PublicKey("So11111111111111111111111111111111111111112"),
    new PublicKey("8yRJB65ZT6pKFBWQkkN4WBdGzFtKmdvJNJcByMa6faBr"),
    "devnet",
    wallet!
  );

  return (
    <div style={{ paddingBottom: 30 }}>
      <div style={{ textAlign: "center", paddingBottom: 30 }}>
        <WalletMultiButton />
      </div>
      <div style={{ marginBottom: 50 }}>
        <h1 style={{ textAlign: "center" }}>Orders</h1>
        <Orders
          connection={connection}
          walletPublicKey={wallet?.publicKey}
          candyShop={candyShop}
          walletConnectComponent={<WalletMultiButton />}
        />
      </div>
      <div style={{ marginBottom: 50 }}>
        <h1 style={{ textAlign: "center" }}>Sell</h1>
        <Sell
          connection={connection}
          walletPublicKey={wallet?.publicKey}
          candyShop={candyShop}
          walletConnectComponent={<WalletMultiButton />}
        />
      </div>
    </div>
  );
};
