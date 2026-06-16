import useSWR, { mutate } from 'swr';
import {
  bulkEditBookingService,
  deleteBookingService,
  deleteBulkBookingService,
  editBookingService,
  getBookingByDate
} from '../services/apis/Booking/bookingService';
import { BookingQueryParam } from '../types/BookingQueryParam';
import { DateEvent } from '../types/DateEvent';
import { BookingBody } from '../types/BookingData';

const fetcher = async (date: string, queryParams: BookingQueryParam): Promise<DateEvent> => {
  const response = await getBookingByDate(date, queryParams);
  return response.data;
};

export const useDateBooking = (date: string, queryParams: BookingQueryParam) => {
  const { data, error, isLoading } = useSWR(
    [`/api/booking/calendar-by-date`, date, queryParams],
    () => fetcher(date, queryParams)
  );

  const editBooking = async (bookingId: string, postBody: BookingBody) => {
    try {
      await editBookingService(bookingId, postBody);

      mutate([`/api/booking/calendar-by-date`, date, queryParams]);
    } catch (err) {
      console.error('Error in editBooking', err);
    }
  };

  const bulkEditBooking = async (
    bookingIds: string[],
    selectedProperty: string,
    inputValue: string
  ) => {
    try {
      await bulkEditBookingService(bookingIds, selectedProperty, inputValue);
      mutate([`/api/booking/calendar-by-date`, date, queryParams]);
    } catch (err) {
      console.error('Error in bulkEditBooking', err);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      await deleteBookingService(bookingId);

      mutate([`/api/booking/calendar-by-date`, date, queryParams]);
    } catch (err) {
      console.error('Error in deleteBooking', err);
    }
  };

  const deleteBulkBooking = async (bookingIds: string[]) => {
    const postBody = {
      bookingIds: bookingIds
    };
    try {
      await deleteBulkBookingService(postBody);

      mutate([`/api/booking/calendar-by-date`, date, queryParams]);
    } catch (err) {
      console.error('Error in deleteBulkBooking', err);
    }
  };
  return {
    dateBookingData: data,
    editBooking,
    bulkEditBooking,
    deleteBooking,
    deleteBulkBooking,
    error,
    isLoading
  };
};
