import { AxiosError } from 'axios';
import axiosInstance from '../axiosInstance';
import { RegistrationData } from '../../../types/RegistrationData';
import { ApiResponse } from '../../../types/ApiResponse';
import { IUser } from '../../../types/User';

const AUTH_URL = import.meta.env.VITE_SERVER_URL;

export const Register = async (data: RegistrationData): Promise<ApiResponse<IUser>> => {
  try {
    const response = await axiosInstance.post(`${AUTH_URL}/register`, data);
    return response.data;
  } catch (error) {
    console.error('Error in registerService/Register', error);
    const errorData = (error as AxiosError)?.response?.data as {
      message?: {
        non_field_errors?: string[];
      };
    };
    const errorMessage = errorData.message?.non_field_errors?.[0];
    throw error;
  }
};
