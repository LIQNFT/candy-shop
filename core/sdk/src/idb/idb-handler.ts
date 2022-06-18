/**
 * A helper to handle idb library to store/retrieve data from IndexedDB in simplest way.
 */
import { openDB, IDBPDatabase, deleteDB } from 'idb';
import { safeAwait, SingleTokenInfo } from '../vendor';
import { CandyShopDB, USER_NFT_OBJECT_STORE } from './idb-model';

const Logger = 'CandyShopSDK/idb-handler';

const CANDY_SHOP_NFT_IDB_NAME = 'candyshop-nft';

export async function storeWalletNftToIDB(walletAddress: string, tokens: SingleTokenInfo[]): Promise<boolean> {
  const db = await openCandyShopIDB();
  const store = await safeAwait(db.put(USER_NFT_OBJECT_STORE, tokens, walletAddress));

  if (store.error) {
    console.log(`${Logger}: Store walletAddress=${walletAddress} tokens failed, error=${store.error}`);
    return false;
  }
  console.log(`${Logger}: Store walletAddress=${walletAddress} tokens success`);
  return true;
}

export async function retrieveWalletNftFromIDB(walletAddress: string): Promise<SingleTokenInfo[] | undefined> {
  const db = await openCandyShopIDB();
  const retrieve = await safeAwait(db.get(USER_NFT_OBJECT_STORE, walletAddress));
  if (retrieve.error) {
    console.log(`${Logger}: Retrieve walletAddress=${walletAddress} tokens failed, error=${retrieve.error}`);
    return undefined;
  }
  return retrieve.result;
}

export async function deleteCandyShopIDB(): Promise<void> {
  return await deleteDB(CANDY_SHOP_NFT_IDB_NAME, {
    blocked() {
      console.log(
        `${Logger}: Can not delete ${CANDY_SHOP_NFT_IDB_NAME} in IndexedDB, there's connection still opening it`
      );
    }
  });
}

// TODO: We will need to take care the version once have more than one objectStore in IDB
function openCandyShopIDB(version?: number): Promise<IDBPDatabase<CandyShopDB>> {
  return openDB(CANDY_SHOP_NFT_IDB_NAME, version, {
    upgrade: (db: IDBPDatabase<CandyShopDB>, oldVersion: number, newVersion: number) => {
      console.log(`${Logger}: upgrading IDB ${db.name} from ${oldVersion} to ${newVersion}`);
      db.createObjectStore(USER_NFT_OBJECT_STORE);
    }
  });
}
