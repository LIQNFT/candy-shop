import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

type FormType = {
  auctionHour: string;
  auctionMinute: string;
  clockFormat: string;
  startNow?: boolean;
  startDate: string;
};

// Format date
export function formatDate(date: string | Date): string {
  const data = new Date(date);

  return `${data.getDate()}/${data.getMonth()}/${data.getFullYear() % 100} ${data.getHours()}:${data.getMinutes()}`;
}

export const getStartTime = (auctionForm: FormType): string => {
  if (!auctionForm.auctionHour || !auctionForm.auctionMinute || !auctionForm.clockFormat) {
    return dayjs.utc().format('MMMM DD, YYYY HH:mm') + ' UTC';
  }

  if (auctionForm.startNow) {
    return dayjs.utc().format('MMMM DD, YYYY HH:mm') + ' UTC';
  }

  return (
    dayjs
      .utc(
        `${auctionForm.startDate} ${convertTime12to24(
          auctionForm.auctionHour,
          auctionForm.auctionMinute,
          auctionForm.clockFormat
        )}`,
        'YYYY-MM-DD HH:mm'
      )
      .format('MMMM DD, YYYY hh:mmA') + ' UTC'
  );
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
