/**
 * Some component has infinity load logic. Because APIs with pagination can return same item,
 * so this function to help filter that item out of list
 * and guarantee React render function and duplicate item UI
 *
 * @param oldList current list is saved in local state
 * @param addList new list is from api response
 * @param key unique field in each item of list
 * @returns
 */
export function removeDuplicate<T>(oldList: T[], addList: T[], key: keyof T): T[] {
  const duplicateList = [...oldList, ...addList];
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
