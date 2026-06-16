import { ApiResponse } from "../../../types/ApiResponse";
import { IRole } from "../../../types/Role";
import axiosInstance from "../axiosInstance";

export const getRoleList = async (): Promise<ApiResponse<IRole[]>> => {
  try {
    const response = await axiosInstance.get("/roles");
    return response.data;
  } catch (error) {
    console.error("Error in getRoleList", error);
    throw error;
  }
};
