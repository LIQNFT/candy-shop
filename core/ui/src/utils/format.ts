// Format date
export function formatDate(date: string | Date): string {
  const data = new Date(date);

  return `${data.getDate()}/${data.getMonth()}/${
    data.getFullYear() % 100
  } ${data.getHours()}:${data.getMinutes()}`;
}
