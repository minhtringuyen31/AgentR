import useSWR from 'swr';
import { getBookingCategoryListService } from '../services/apis/Booking/bookingService';
import { BookingCategory } from '../types/BookingCategory';

const fetcher = async (): Promise<BookingCategory[]> => {
  const response = await getBookingCategoryListService();
  return response.data;
};

export const useBookingCategory = () => {
  const { data, error, isLoading } = useSWR([`/api/category-bookings`], () => fetcher());
  return {
    bookingCategorysData: data,
    error,
    isLoading
  };
};
