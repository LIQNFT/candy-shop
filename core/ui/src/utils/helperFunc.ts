/**
 * Some component has infinity load logic. Because APIs with pagination can return same item,
 * so this function to help filter that item out of list
 * and guarantee React render function and duplicate item UI
 *
 * @param firstList current list is saved in local state
 * @param secondList new list is from api response
 * @param key unique field in each item of list
 * @returns
 */
export function removeDuplicate<T>(firstList: T[], secondList: T[], key: keyof T): T[] {
  const duplicateList = [...firstList, ...secondList];
  const newList: T[] = [];
  const memo: any = {};
  for (const item of duplicateList) {
    if (memo[item[key]]) break;
    newList.push(item);
    memo[item[key]] = true;
  }
  return newList;
}

/**
 * This function prevents double call api transaction in useEffect and package react-infinite-scroll-component
 */
export function EMPTY_FUNCTION(): void {
  //
}

export function getCountdownTimerString(countdown: number): string {
  const hours = Math.floor(countdown / 3600);
  const minutes = Math.floor((countdown - hours * 3600) / 60);
  const seconds = countdown - hours * 3600 - minutes * 60;

  const hoursString = hours > 9 ? hours : `0${hours}`;
  const minutesString = `0${minutes}`.slice(-2);
  const secondsString = `0${seconds}`.slice(-2);
  return `${hoursString}:${minutesString}:${secondsString}`;
}

const NUMBER_OF_CHAR = 4;
export const shortenAddress = (address: string, chars = NUMBER_OF_CHAR): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

/**
 * This function help to remove listeners from socket.
 * @param controllers
 */

export function removeListeners(controllers: AbortController[]): void {
  for (const con of controllers) {
    con.abort();
  }
}
