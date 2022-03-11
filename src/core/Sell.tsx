import React from 'react';
import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Col, Empty, Row, Skeleton } from 'antd';
import { useEffect, useState } from 'react';

import { singleTokenInfoPromise } from '../api/fetchMetadata';
import { Nft } from '../components/Nft';
import { Program } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import { CandyShop } from '..';
import { getCandyShop } from '../api/utils';
import candyShopIDL from "../idl/liqnft-market.json";
import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";

const test = async (wallet: AnchorWallet) => {
  const candyShopCreator = '6f7LLqpDTkCyp2axGugB32zTdMEq3ibVVrJgmF94LkPP';
  const payer = Keypair.fromSecretKey(
    new Uint8Array([
      234,
      33,
      22,
      245,
      152,
      121,
      121,
      39,
      205,
      3,
      89,
      169,
      51,
      101,
      66,
      94,
      211,
      210,
      45,
      67,
      170,
      24,
      53,
      255,
      176,
      164,
      16,
      104,
      89,
      1,
      87,
      78,
      9,
      204,
      158,
      14,
      83,
      187,
      191,
      110,
      248,
      141,
      223,
      238,
      222,
      208,
      4,
      67,
      171,
      236,
      59,
      195,
      2,
      251,
      56,
      64,
      3,
      63,
      181,
      235,
      120,
      156,
      128,
      5,
    ])
  );

  const provider = new anchor.Provider(
    new Connection(clusterApiUrl('devnet'), 'confirmed'),
    wallet as anchor.Wallet,
    {}
  );
  const candyShopProgram = new Program(
    candyShopIDL as anchor.Idl,
    candyShopIDL.metadata.address,
    provider
  );

  const [candyShop] = await getCandyShop(
    new PublicKey(candyShopCreator),
    candyShopProgram.programId
  );

  const candyShopInstance = new CandyShop(
    candyShop.toString(),
    candyShopCreator,
    candyShopProgram
  );

  await candyShopInstance.sell(
    payer,
    new PublicKey('7nRquQ7kBM4ot4A1E2nV5ZroTnq3fCbvKUcWM9M2xqu3'),
    new PublicKey('3ifby4zkFeSq77r8LswGNxFUarRRF3skG3BfTmR7o2Fy'),
    new PublicKey('So11111111111111111111111111111111111111112'),
    new PublicKey('Aw7UZgxv6taj9ndw12EjANmH6XSGR5yFGZiaWTVDC2sh'),
    new anchor.BN(0.01),
    new anchor.BN(1),
    candyShopProgram
  );
};

/**
 * React component that displays a list of orders
 */
export const Sell = () => {
  const wallet = useAnchorWallet();

  AnchorWal

  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // Fetch order list
    singleTokenInfoPromise(
      connection,
      '5q1yeHbxChPkDNgG893oeNaiST1K6TXTsVCsoSue2eAC'
    )
      .then((data: any) => {
        // No data will return
        if (!data) return;

        setNfts([data]);
      })
      .catch(err => {
        console.info('singleTokenInfoPromise failed: ', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [singleTokenInfoPromise]);

  return (
    <div className="candy-shop-list">
      <Row gutter={[
        { md: 24, xs: 16 },
        { md: 24, xs: 16 }
      ]}>
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, key) => (
              <Col key={key} md={8} xs={24}>
                <Skeleton />
              </Col>
            ))
        ) : !nfts.length ? (
          <Col span={24}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Col>
        ) : (
          nfts
            .filter(item => !!item)
            .map((item, key) => (
              <Col key={key} md={8} xs={24}>
                <button onClick={() => wallet && test(wallet)}>test</button>
                <Nft nft={item} />
              </Col>
            ))
        )}
      </Row>
    </div>
  );
};
