import React, { useState } from 'react';
import { web3, BN } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'components/Modal';
import { Processing } from 'components/Processing';
import { getAccount } from '@solana/spl-token';

import BuyModalConfirmed from './BuyModalConfirmed';
import BuyModalDetail from './BuyModalDetail';

import { ShopExchangeInfo, TransactionState } from 'model';
import { useUnmountTimeout } from 'hooks/useUnmountTimeout';
import {
  CandyShopTrade,
  CandyShopTradeBuyParams,
  CandyShopVersion,
  getAtaForMint,
  WRAPPED_SOL_MINT
} from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { handleError, ErrorType, ErrorMsgMap } from 'utils/ErrorHandler';
import { notification, NotificationType } from 'utils/rc-notification';
import { TIMEOUT_EXTRA_LOADING } from 'constant';

import './style.less';

export interface BuyModalProps {
  order: OrderSchema;
  onClose: () => void;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  exchangeInfo: ShopExchangeInfo;
  shopAddress: web3.PublicKey;
  candyShopProgramId: web3.PublicKey;
  connection: web3.Connection;
  isEnterprise: boolean;
  candyShopVersion: CandyShopVersion;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  order,
  onClose,
  wallet,
  walletConnectComponent,
  exchangeInfo,
  shopAddress,
  candyShopProgramId,
  connection,
  isEnterprise,
  candyShopVersion,
  shopPriceDecimalsMin,
  shopPriceDecimals
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const [hash, setHash] = useState(''); // txHash

  const timeoutRef = useUnmountTimeout();

  const buy = async () => {
    if (!wallet) {
      notification(ErrorMsgMap[ErrorType.InvalidWallet], NotificationType.Error);
      return;
    }
    setState(TransactionState.PROCESSING);
    // check balance before proceed
    /*let balance: BN;
    const connection = candyShop.connection();

    if (candyShop.treasuryMint.equals(WRAPPED_SOL_MINT)) {
      const account = await connection.getAccountInfo(wallet.publicKey);
      if (!account) {
        notification(ErrorMsgMap[ErrorType.GetAccountInfoFailed], NotificationType.Error);
        return;
      }
      balance = new BN(account.lamports.toString());
    } else {
      // prettier-ignore
      const ata = (await getAtaForMint(candyShop.treasuryMint, wallet.publicKey))[0];
      try {
        const account = await getAccount(connection, ata);
        balance = new BN(account.amount.toString());
      } catch (err) {
        balance = new BN('0');
      }
    }*/

    const tradeBuyParams: CandyShopTradeBuyParams = {
      tokenAccount: new web3.PublicKey(order.tokenAccount),
      tokenMint: new web3.PublicKey(order.tokenMint),
      price: new BN(order.price),
      wallet: wallet,
      seller: new web3.PublicKey(order.walletAddress),
      connection: connection,
      shopAddress: shopAddress,
      candyShopProgramId: candyShopProgramId,
      isEnterprise: isEnterprise,
      candyShopVersion: candyShopVersion,
      // Replace with the order's
      shopCreatorAddress: new web3.PublicKey(order.candyShopCreatorAddress),
      shopTreasuryMint: new web3.PublicKey(order.treasuryMint)
    };

    return CandyShopTrade.buy(tradeBuyParams)
      .then((txHash) => {
        setHash(txHash);
        console.log('Buy order made with transaction hash', txHash);
        timeoutRef.current = setTimeout(() => {
          setState(TransactionState.CONFIRMED);
        }, TIMEOUT_EXTRA_LOADING);
      })
      .catch((err) => {
        console.log({ err });
        handleError({ error: err });
        setState(TransactionState.DISPLAY);
      });
  };

  return (
    <Modal onCancel={onClose} width={state !== TransactionState.DISPLAY ? 600 : 1000}>
      <div className="candy-buy-modal">
        {state === TransactionState.DISPLAY && (
          <BuyModalDetail
            order={order}
            buy={buy}
            walletPublicKey={wallet?.publicKey}
            walletConnectComponent={walletConnectComponent}
            exchangeInfo={exchangeInfo}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            shopPriceDecimals={shopPriceDecimals}
          />
        )}
        {state === TransactionState.PROCESSING && <Processing text="Processing purchase" />}
        {state === TransactionState.CONFIRMED && wallet && (
          <BuyModalConfirmed
            walletPublicKey={wallet.publicKey}
            order={order}
            txHash={hash}
            onClose={onClose}
            exchangeInfo={exchangeInfo}
            shopPriceDecimalsMin={shopPriceDecimalsMin}
            shopPriceDecimals={shopPriceDecimals}
          />
        )}
      </div>
    </Modal>
  );
};
