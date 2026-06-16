// import { toast } from "react-toastify";
import { AxiosError } from 'axios';
import axiosInstance from '../axiosInstance';
import { Token } from '../../../types/Token';
import { ApiResponse } from '../../../types/ApiResponse';

const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const login = async (username: string, password: string): Promise<ApiResponse<Token>> => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/login`, {
      username,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Error in authService/login', error);
    const errorData = (error as AxiosError)?.response?.data as {
      message?: string;
      non_field_errors?: string[];
    };
    const errorMessage = errorData.message || errorData.non_field_errors?.[0];
    // toast.error(errorMessage);
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/forgot-password`, {
      email
    });
    // toast.success(response.data.message);
    return response.data;
  } catch (error) {
    console.error('Error in authService/forgotPassword', error);
    const errorData = (error as AxiosError)?.response?.data as {
      message?: string;
      non_field_errors?: string[];
    };
    const errorMessage = errorData.message || errorData.non_field_errors?.[0];
    // toast.error(errorMessage);
    throw error;
  }
};

export const resetPassword = async (
  newPassword: string,
  uid: string,
  token: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/reset-password`, {
      newPassword,
      uid,
      token
    });
    // toast.success(response.data.message);
    return response.data;
  } catch (error) {
    console.error('Error in authService/resetPassword', error);
    const errorData = (error as AxiosError)?.response?.data as {
      message?: string;
      non_field_errors?: string[];
    };
    const errorMessage = errorData.message || errorData.non_field_errors?.[0];
    // toast.error(errorMessage);
    throw error;
  }
};

export const refreshToken = async (refreshToken: string): Promise<Token> => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/refresh`, {
      refreshToken
    });
    return response.data;
  } catch (error) {
    console.error('Error in refreshToken', error);
    throw error;
  }
};

export const changePasswordService = async (oldPassword: string, newPassword: string) => {
  try {
    const postBody = {
      oldPassword: oldPassword,
      newPassword: newPassword
    };
    const response = await axiosInstance.post('change-password', postBody);
    // toast.success("Change password successfully");
    return response;
  } catch (error) {
    console.error('Error in changePasswordService', error);
    const errorData = (error as AxiosError)?.response?.data as {
      message?: string;
      non_field_errors?: string[];
    };
    const errorMessage = errorData.message || errorData.non_field_errors?.[0];
    // toast.error(errorMessage);
    throw error;
  }
};
