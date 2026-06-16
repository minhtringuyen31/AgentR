import { IChannel } from '@/types/Channel';
import { ListResponse } from '@/types/ListResponse';
import { ApiResponse } from '../../../types/ApiResponse';
import axiosInstance from '../axiosInstance';

export const getChannelListService = async (): Promise<ApiResponse<ListResponse<IChannel>>> => {
  try {
    const response = await axiosInstance.get(`/channels`);
    return response.data;
  } catch (error) {
    console.error('Error in channelService/getChannelListService', error);
    throw error;
  }
};

export const deleteChannelService = async (channelId: string) => {
  try {
    const response = await axiosInstance.delete(`/channels/${channelId}`);
    return response.data;
  } catch (error) {
    console.error('Error in channelService/deleteChannelService', error);
    throw error;
  }
};

// export const deleteFlowDesignService = async (
//   flowDesignId: string,
// ): Promise<ApiResponse<null>> => {
//   try {
//     const response = await axiosInstance.delete(`/flow-design/${flowDesignId}`);
//     toast.success("Delete Flow Successfully");
//     return response.data;
//   } catch (error) {
//     const errorData = (error as AxiosError)?.response?.data as {
//       message?: string;
//       non_field_errors?: string[];
//     };
//     const errorMessage = errorData.message ?? errorData.non_field_errors?.[0];
//     toast.error(errorMessage);
//     console.error("Error in flowService/deleteFlowDesignService", error);
//     throw error;
//   }
// };
