import useSWR, { mutate } from 'swr';
import {
  bulkEditBookingService,
  createBookingService,
  deleteBookingService,
  deleteBulkBookingService,
  editBookingService,
  getBookingByAdvanceSearch,
  getBookingByDate
} from '../services/apis/Booking/bookingService';
import { BookingQueryParam } from '../types/BookingQueryParam';
import { BookingBody } from '../types/BookingData';

// TODO: Tai sao cac function API call lai tra ve payload khac nhau? Cai thi tra ve response.data.data, cai thi tra ve response.data?
// TODO: TypeScript thieu define type cua cac API response
const fetcher = async (queryParams: BookingQueryParam) => {
  const response = await getBookingByAdvanceSearch(queryParams);
  return response.data.data;
};

export const useCalendarBooking = (queryParams: BookingQueryParam) => {
  const { data, error, isLoading } = useSWR([`/api/bookings/filter`, queryParams], () =>
    fetcher(queryParams)
  );

  const getDateBooking = async (date: string, queryParams: BookingQueryParam) => {
    try {
      const response = await getBookingByDate(date, queryParams);
      return response.data;
    } catch (err) {
      console.error('Error in getDateBooking', err);
    }
  };

  const createBooking = async (postBody: BookingBody) => {
    try {
      await createBookingService(postBody);

      mutate([`/api/bookings/filter`, queryParams]);
    } catch (err) {
      console.error('Error in createBooking', err);
    }
  };

  const editBooking = async (bookingId: string, postBody: BookingBody) => {
    try {
      await editBookingService(bookingId, postBody);

      mutate([`/api/bookings/filter`, queryParams]);
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
      mutate([`/api/bookings/filter`, queryParams]);
    } catch (err) {
      console.error('Error in bulkEditBooking', err);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      await deleteBookingService(bookingId);

      mutate([`/api/bookings/filter`, queryParams]);
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

      mutate([`/api/bookings/filter`, queryParams]);
    } catch (err) {
      console.error('Error in deleteBulkBooking', err);
    }
  };

  return {
    eventsData: data,
    getDateBooking,
    createBooking,
    editBooking,
    bulkEditBooking,
    deleteBooking,
    deleteBulkBooking,
    error,
    isLoading
  };
};
