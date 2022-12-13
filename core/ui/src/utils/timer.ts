import dayjs from 'dayjs';

interface TimeInfo {
  hour: string;
  minute: string;
  clockFormat: string;
  isNow?: boolean;
  date: string;
}

export function formatDate(date: string | Date): string {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

export const getFormTime = (timeData: TimeInfo): string => {
  if (!timeData.hour || !timeData.minute || !timeData.clockFormat) {
    return dayjs().format('YYYY-MM-DD HH:mm');
  }

  if (timeData.isNow) {
    return dayjs().format('YYYY-MM-DD HH:mm');
  }

  return `${timeData.date} ${convertTime12to24(timeData.hour, timeData.minute, timeData.clockFormat)}`;
};

export const convertTime12to24 = (hour: string, min: string, clockFormat: string): string => {
  if (hour === '12') {
    hour = '00';
  }
  if (clockFormat === 'PM') {
    hour = (parseInt(hour, 10) + 12).toString();
  }
  return `${hour}:${min}`;
};
