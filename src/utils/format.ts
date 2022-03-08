// Format id token, format value return will be 123abc...abcd
export function formatID(id: string): string {
  if (!id) return '';

  if (id.length <= 10) return id;

  return `${id.slice(0, 6)}...${id.slice(-5)}`
}

// Format date
export function formatDate(date: string | Date): string {
  const data = new Date(date);

  return `${data.getDate()}/${data.getMonth()}/${data.getFullYear() % 100} ${data.getHours()}:${data.getMinutes()}`
}