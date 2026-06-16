import { RegistrationData } from '../../../types/RegistrationData';
// import { toast } from "react-toastify";
import { UserBody } from '../../../types/UserBody';
import axiosInstance from '../axiosInstance';
import { ApiResponse } from '../../../types/ApiResponse';
import { UserListResponse } from '../../../types/UserListResponse';
import { IUser } from '../../../types/User';
import axios from 'axios';

export const getUserInfoService = async (): Promise<ApiResponse<IUser>> => {
  try {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error in userService/getUserInfoService', error);
    throw error;
  }
};

export const getUserListService = async (
  page: number,
  limit: number,
  teamId: string,
  keyword: string
): Promise<ApiResponse<UserListResponse>> => {
  try {
    const response = await axiosInstance.get(
      `/users?page=${page}&limit=${limit}&teamId=${teamId}&search=${keyword}`
    );
    return response.data;
  } catch (error) {
    console.error('Error in userService/getUserListService', error);
    throw error;
  }
};

// export const getUserListByTeamService = async (
//   page: number,
//   limit: number,
//   teamId: string,
// ) => {
//   try {
//     const response = await axiosInstance.get(
//       `teams/${teamId}/users?page=${page}&limit=${limit}`,
//     );
//     return response;
//   } catch (error) {
//     console.error("Error fetching user list by team:", error);
//     throw error;
//   }
// };

export const updateUserService = async (
  userId: string,
  postBody: UserBody
): Promise<ApiResponse<IUser>> => {
  try {
    const response = await axiosInstance.patch(`/users/${userId}`, postBody);
    return response.data;
  } catch (error) {
    console.error('Error in userService/updateUserService', error);
    throw error;
  }
};

export const updateBulkUserService = async (
  userIds: string[],
  selectedProperty: string,
  inputValue: string
): Promise<ApiResponse<IUser[]>> => {
  try {
    const postBody = {
      userIds,
      [selectedProperty]: inputValue
    };
    const response = await axiosInstance.put('/users/update', postBody);
    return response.data;
  } catch (error) {
    console.error('Error in userService/updateBulkUserService', error);
    throw error;
  }
};

export const deleteBulkUserService = async (postBody: { userIds: string[] }) => {
  try {
    const response = await axiosInstance.delete('/users/bulk', {
      data: postBody
    });
    return response.data;
  } catch (error) {
    console.error('Error in userService/deleteBulkUserService', error);
    throw error;
  }
};

export const inviteUserService = async (postBody: {
  emails: string[];
  role: string;
}): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.post('/users/invite', postBody);
    // toast.success("Invite User Successfully");
    return response.data;
  } catch (error) {
    console.error('Error in userService/inviteUserService', error);
    throw error;
  }
};

export const createUserService = async (
  postBody: RegistrationData
): Promise<ApiResponse<IUser>> => {
  try {
    const response = await axiosInstance.post('/users/create', postBody);
    // toast.success("Create User Successfully");
    return response.data;
  } catch (error) {
    console.error('Error in userService/createUserService', error);
    throw error;
  }
};

export const updatePersonalInfoService = async (postBody: object): Promise<ApiResponse<IUser>> => {
  try {
    const response = await axiosInstance.patch(`/users/me`, postBody);
    // toast.success("Create Profile Successfully");
    return response.data;
  } catch (error) {
    console.error('Error in userService/updatePersonalInfoService', error);
    throw error;
  }
};

export const getImageUrlService = async (
  objectName: string
): Promise<ApiResponse<{ url: string }>> => {
  try {
    const response = await axiosInstance.get(`/generate-presigned-url`, {
      params: { object_name: objectName }
    });
    return response.data;
  } catch (error) {
    console.error('Error in userService/getImageUrlService', error);
    throw error;
  }
};

export const uploadImageToS3Service = async (url: string, file: File) => {
  try {
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type
      }
    });
  } catch (error) {
    console.error('Error in userService/uploadImageToS3Service', error);
    throw error;
  }
};
