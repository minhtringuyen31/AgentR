import { BookingStatus } from '@/constants';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
dayjs.extend(isoWeek);

export function getMonth(month = dayjs().month()) {
  month = Math.floor(month);
  const year = dayjs().year();
  const firstDayOfTheMonth = dayjs(new Date(year, month, 1)).isoWeekday();
  let currentMonthCount = 0 - firstDayOfTheMonth + 1;
  const daysMatrix = new Array(5).fill([]).map(() => {
    return new Array(7).fill(null).map(() => {
      currentMonthCount++;
      return dayjs(new Date(year, month, currentMonthCount));
    });
  });
  return daysMatrix;
}

export function formatDate(startAt: string): string {
  const date = new Date(startAt);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

export function formatLongDateTime(dateStr?: string): string {
  if (!dateStr) return '';

  const date = dayjs(dateStr);

  return date.format('DD MMM YYYY HH:mm');
}

export function formatDateTitle(inputDate: string) {
  const [day, month, year] = inputDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  const dayOfWeek = weekDays[date.getUTCDay()];
  const monthName = monthNames[date.getUTCMonth()];
  return `${dayOfWeek} ${day} ${monthName}, ${year}`;
}

export const formatTimeRange = (startAt: string, endAt: string): string => {
  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  const formattedStartTime = new Intl.DateTimeFormat('en-US', formatOptions).format(startDate);
  const formattedEndTime = new Intl.DateTimeFormat('en-US', formatOptions).format(endDate);

  return `${formattedStartTime} - ${formattedEndTime}`;
};

export const convertUtcTime = (date: string, time: string) => {
  const dateTimeString = `${date}T${time}:00Z`;
  const localTime = dayjs(dateTimeString).local();

  return localTime.format();
};

export const convertUtcToDate = (utc: string) => {
  const localTime = dayjs.utc(utc).local();

  return {
    date: localTime.format('YYYY-MM-DD'),
    time: localTime.format('HH:mm')
  };
};

export const getTagColor = (status: string) => {
  switch (status) {
    case BookingStatus.DONE:
      return 'success';
    case BookingStatus.CANCEL:
      return 'danger';
    case BookingStatus.IN_PROCESS:
      return 'warning';
    default:
      return 'primary';
  }
};

export const getNameFirstLetters = (name?: string) => {
  if (!name) return null;
  const words = name.split(' ');
  if (!words) return null;

  const firstLetters =
    words.length > 1
      ? words[0]?.charAt(0).toUpperCase() + words[1]?.charAt(0).toUpperCase()
      : words[0]?.charAt(0).toUpperCase();
  return firstLetters;
};
