import { ApiResponse } from "../../../types/ApiResponse";
import { ITeam } from "../../../types/Team";
import { TeamListResponse } from "../../../types/TeamListResponse";
import axiosInstance from "../axiosInstance";

export const getTeamListService = async (
  page: number,
  limit: number,
  keyword: string,
): Promise<ApiResponse<TeamListResponse>> => {
  try {
    const response = await axiosInstance.get(
      `/teams?page=${page}&limit=${limit}&search=${keyword}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error in getTeamListService", error);
    throw error;
  }
};

export const addTeamService = async (postBody: {
  id: string;
  name: string;
}): Promise<ApiResponse<ITeam>> => {
  try {
    const response = await axiosInstance.post("/teams", postBody);
    return response.data;
  } catch (error) {
    console.error("Error in addTeamService", error);
    throw error;
  }
};

export const addUserToTeamService = async (postBody: {
  userIds: string[];
  teamIds: string[];
}): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.post(`/teams/add-users`, postBody);
    return response.data;
  } catch (error) {
    console.error("Error in addUserToTeamService", error);
    throw error;
  }
};

export const removeUserFromTeamService = async (postBody: {
  userIds: string[];
  teamIds: string[];
}): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.delete(`/teams/remove-users`, {
      data: postBody,
    });
    return response.data;
  } catch (error) {
    console.error("Error in removeUserFromTeamService", error);
    throw error;
  }
};

export const updateUserInTeamService = async (
  action: string,
  postBody: {
    userIds: string[];
    teamIds: string[];
  },
): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.post(`/teams/${action}`, postBody);
    return response.data;
  } catch (error) {
    console.error("Error in updateUserInTeamService", error);
    throw error;
  }
};

export const updateTeamService = async (postBody: {
  teamId: string;
  name: string;
}): Promise<ApiResponse<ITeam>> => {
  try {
    const response = await axiosInstance.patch(
      `/teams/${postBody.teamId}`,
      postBody,
    );
    return response.data;
  } catch (error) {
    console.error("Error in updateTeamService", error);
    throw error;
  }
};

export const deleteBulkTeamService = async (postBody: {
  teamIds: string[];
}): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.delete("/teams/bulk", {
      data: postBody,
    });
    return response.data;
  } catch (error) {
    console.error("Error in deleteBulkTeamService", error);
    throw error;
  }
};
