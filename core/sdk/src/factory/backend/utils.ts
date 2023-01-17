import { Blockchain } from '@liqnft/candy-shop-types';

/**
 * Get the parameterize string of single query / multiple queries
 * @param queryString string or array of string
 * @returns string with parameter for sending request to server
 */
export const getParametrizeQuery = (queryString: string | string[]): string => {
  if (!queryString || queryString.length === 0) {
    return '';
  }
  const singleQuery = typeof queryString === 'string';
  if (singleQuery) {
    return `?${queryString}`;
  }
  // Multiple queries case
  const firstQuery = queryString[0];
  let followQueries = '';
  for (let i = 1; i < queryString.length; i++) {
    followQueries = followQueries.concat(`&${queryString[i]}`);
  }
  return `?${firstQuery}${followQueries}`;
};

export const mapToCompatibleBlockchain = (blockchain?: Blockchain): string | undefined => {
  if (blockchain === Blockchain.SolDevnet || blockchain === Blockchain.SolMainnetBeta) {
    return Blockchain.Sol;
  }
  return blockchain;
};
