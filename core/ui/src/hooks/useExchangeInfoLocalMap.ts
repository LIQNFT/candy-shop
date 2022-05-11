import { Dispatch, SetStateAction, useEffect, useState } from 'react';

enum HashTableEnum {
  EMPTY
}

export interface HashTable {
  [treasuryMint: string]: {
    symbol: string;
    decimals: number;
    logoURI: string;
  };
}

interface HooksReturnValue {
  hashTable: HashTable;
  setHashTable: Dispatch<SetStateAction<HashTable>>;
}

const HASH_TABLE: HashTable = {
  So11111111111111111111111111111111111111112: {
    symbol: 'SOL',
    decimals: 9,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  '56pdaHboK66cxRLkzkYVvFSAjfoNEETJUsrdmAYaTXMJ': {
    symbol: 'TEST',
    decimals: 9,
    logoURI: 'https://haycafe.vn/wp-content/uploads/2022/03/Avatar-hai-1.jpg'
  }
};

export function useHashTable(): HooksReturnValue {
  const [hashTable, setHashTable] = useState<HashTable>(HASH_TABLE);
  // const [hashTableStringify] = useState<string | HashTableEnum>(
  //   localStorage.getItem('hashTable') || HashTableEnum.EMPTY
  // );

  useEffect(() => {
    const hashTableStringify = localStorage.getItem('hashTable') || HashTableEnum.EMPTY;
    if (hashTableStringify === HashTableEnum.EMPTY) {
      localStorage.setItem('hashTable', JSON.stringify(HASH_TABLE));
    } else {
      setHashTable(JSON.parse(hashTableStringify));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hashTable', JSON.stringify(hashTable));
  }, [hashTable]);

  return { hashTable, setHashTable };
}
