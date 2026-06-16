import { ApiResponse } from '../../../types/ApiResponse';
import { BookingCategory } from '../../../types/BookingCategory';
import { Booking, BookingBody } from '../../../types/BookingData';
import { BookingQueryParam } from '../../../types/BookingQueryParam';
import axiosInstance from '../axiosInstance';
import { AxiosError } from 'axios';

export const getBookingCalendarService = async (month: number, year: number) => {
  try {
    const response = await axiosInstance.get('/bookings/calendar', {
      params: { month, year }
    });
    return response;
  } catch (error) {
    console.error('Error in getBookingCalendarService', error);
    throw error;
  }
};

export const getBookingByDate = async (date: string, queryParam: BookingQueryParam) => {
  try {
    const response = await axiosInstance.get('/bookings/calendar-by-date', {
      params: { date, ...queryParam }
    });
    return response.data;
  } catch (error) {
    console.error('Error in getBookingByDate', error);
    throw error;
  }
};

export const getBookingByAdvanceSearch = async (queryParam: BookingQueryParam) => {
  try {
    const response = await axiosInstance.get('/bookings/filter', {
      params: {
        ...queryParam
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in getBookingByAdvanceSearch', error);
    throw error;
  }
};

export const getBookingById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return response;
  } catch (error) {
    console.error('Error in getBookingById', error);
    throw error;
  }
};

export const getBookingCategoryListService = async (): Promise<ApiResponse<BookingCategory[]>> => {
  try {
    const response = await axiosInstance.get('/category-bookings');
    return response.data;
  } catch (error) {
    console.error('Error in getBookingCategoryListService', error);
    throw error;
  }
};

export const createBookingService = async (postBody: BookingBody) => {
  try {
    const response = await axiosInstance.post('/bookings', postBody);
    // toast.success("Create Booking Successfully");
    return response.data;
  } catch (error) {
    const errorData = (error as AxiosError)?.response?.data as {
      message?: string;
      non_field_errors?: string[];
    };
    const errorMessage = errorData.message ?? errorData.non_field_errors?.[0];
    // toast.error(errorMessage);
    console.error('Error in createBookingService', error);
    throw error;
  }
};

export const editBookingService = async (bookingId: string, postBody: BookingBody) => {
  try {
    const response = await axiosInstance.patch(`/bookings/${bookingId}`, postBody);
    // toast.success("Edit Booking Successfully");
    return response.data;
  } catch (error) {
    const errorData = (error as AxiosError)?.response?.data as {
      message?: string;
      non_field_errors?: string[];
    };
    const errorMessage = errorData.message ?? errorData.non_field_errors?.[0];
    // toast.error(errorMessage);
    console.error('Error editBookingService', error);
    throw error;
  }
};

export const bulkEditBookingService = async (
  bookingIds: string[],
  selectedProperty: string,
  inputValue: string
): Promise<ApiResponse<Booking[]>> => {
  try {
    const postBody = {
      bookingIds,
      [selectedProperty]: inputValue
    };
    const response = await axiosInstance.put('/bookings/update', postBody);
    // toast.success("Bulk Edit Booking Successfully");
    return response.data;
  } catch (error) {
    const errorData = (error as AxiosError)?.response?.data as {
      message?: string;
      non_field_errors?: string[];
    };
    const errorMessage = errorData.message ?? errorData.non_field_errors?.[0];
    // toast.error(errorMessage);
    console.error('Error in bulkEditBookingService', error);
    throw error;
  }
};

export const deleteBookingService = async (bookingId: string): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.delete(`/bookings/${bookingId}`);
    // toast.success("Delete Booking Successfully");
    return response.data;
  } catch (error) {
    const errorData = (error as AxiosError)?.response?.data as {
      message?: string;
      non_field_errors?: string[];
    };
    const errorMessage = errorData.message ?? errorData.non_field_errors?.[0];
    // toast.error(errorMessage);
    console.error('Error in deleteBookingService', error);
    throw error;
  }
};

export const deleteBulkBookingService = async (postBody: {
  bookingIds: string[];
}): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.delete('/bookings/bulk', {
      data: postBody
    });
    // toast.success("Bulk Delete Booking Successfully");
    return response.data;
  } catch (error) {
    const errorData = (error as AxiosError)?.response?.data as {
      message?: string;
      non_field_errors?: string[];
    };
    const errorMessage = errorData.message ?? errorData.non_field_errors?.[0];
    // toast.error(errorMessage);
    console.error('Error in deleteBulkBookingService', error);
    throw error;
  }
};
