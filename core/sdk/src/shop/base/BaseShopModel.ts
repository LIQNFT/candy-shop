/**
 * Explorer link source on checking on-chain information
 */

export enum ExplorerLinkBase {
  SolScan = 'SolScan',
  SolanaFM = 'SolanaFM',
  Explorer = 'Explorer',
  Polygon = 'Polygon',
  Mumbai = 'Mumbai',
  Eth = 'Eth',
  Goerli = 'Goerli'
}

/**
 * Program version that CandyShop was created with
 */
export enum CandyShopVersion {
  V1,
  V2
}

/**
 * Blockchains that CandyShop supports
 */
export enum BlockchainType {
  Ethereum = 'Ethereum',
  Solana = 'Solana'
}

/**
 * Custom Shop settings
 *
 * @property {string} currencySymbol
 * @property {number} currencyDecimals
 * @property {number} priceDecimals
 * @property {number} volumeDecimals
 * @property {string} mainnetConnectionUrl
 * @property {object | undefined} connectionConfig
 */
export interface ShopSettings {
  /** Shop transaction currency symbol (default is SOL) */
  currencySymbol: string;
  /** Shop transaction currency decimals (default is 9 for SOL) */
  currencyDecimals: number;
  /** Number of min decimals to display for price numbers (default is 0) */
  priceDecimalsMin: number;
  /** Number of max decimals to display for price numbers (default is 3) */
  priceDecimals: number;
  /** Number of min decimals to display for volume numbers (default is 0) */
  volumeDecimalsMin: number;
  /** Number of max decimals to display for volume numbers (default is 1) */
  volumeDecimals: number;
  /** Rpc connection endpoint */
  mainnetConnectionUrl: string;
  /** Connection config options */
  connectionConfig: object | undefined;
  /** Explorer link options */
  explorerLink: ExplorerLinkBase;
}
