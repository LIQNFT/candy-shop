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
