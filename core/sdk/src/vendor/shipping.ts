/*  This file should not be exposed in src/index.ts */
import { CandyShopVersion } from '../CandyShopModel';
import { BuyAndExecuteSaleTransactionParams } from '../factory/program/model';
import { insBuyAndExecuteSale } from '../factory/program/v2/marketplace';

/**
 * Get txHash from different executions for proceeding to buy
 *
 * @param {boolean} isEnterprise
 * @param {BuyAndExecuteSaleTransactionParams} params required params for buy/sell transaction
 * @return {string} txHash
 */
export function proceedToBuy(
  isEnterprise: boolean,
  callParams: {
    params: BuyAndExecuteSaleTransactionParams;
    version: CandyShopVersion;
    v1Func: (params: any) => Promise<string>;
    v2Func: (params: any) => Promise<string>;
  }
): Promise<string> {
  const { params, version, v1Func, v2Func } = callParams;

  if (isEnterprise) {
    return insBuyAndExecuteSale(params);
  }
  return supply(params, version, v1Func, v2Func);
}

/**
 * Get txHash by calling either v1 or v2 version of passed function based on candy shop version
 *
 * @param {any} params argument to the function to call
 * @param {CandyShopVersion} version version of the candy shop
 * @param {function} v1Func function to call if using v1 candy shop
 * @param {function} v2Func function to call if using v1 candy shop
 * @return {string} txHash
 */
// Please feel free to come up with better name :)
export function supply(
  params: any,
  version: CandyShopVersion,
  v1Func: (params: any) => Promise<string>,
  v2Func: (params: any) => Promise<string>
): Promise<string> {
  if (version === CandyShopVersion.V1) {
    return v1Func(params);
  } else {
    return v2Func(params);
  }
}
