import { ListResponse } from '@/types/ListResponse';
import { ApiResponse } from '@/types/ApiResponse';
import { FlowData, FlowDesign, FlowDesignBody, FlowTrigger } from '@/types/FlowData';
import axiosInstance from '../axiosInstance';

export const createFlowDesign = async (
  postBody: FlowDesignBody
): Promise<ApiResponse<FlowDesign>> => {
  try {
    const response = await axiosInstance.post('/flow-design', postBody);
    return response.data;
  } catch (error) {
    console.error('Error in flowService/createFlowDesign', error);
    throw error;
  }
};

export const getFlowTriggerListService = async (): Promise<
  ApiResponse<ListResponse<FlowTrigger>>
> => {
  try {
    const response = await axiosInstance.get(`/flow`);
    return response.data;
  } catch (error) {
    console.error('Error in flowService/getFlowTriggerListService', error);
    throw error;
  }
};

export const getFlowDesignListService = async (
  page: number,
  limit: number,
  keyword: string,
  status: string
): Promise<ApiResponse<ListResponse<FlowDesign>>> => {
  try {
    const response = await axiosInstance.get(
      `/flow-design?page=${page}&limit=${limit}&search=${keyword}&status=${status}`
    );
    return response.data;
  } catch (error) {
    console.error('Error in flowService/getFlowListService', error);
    throw error;
  }
};

export const deleteFlowDesignService = async (flowDesignId: string): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.delete(`/flow-design/${flowDesignId}`);
    return response.data;
  } catch (error) {
    console.error('Error in flowService/deleteFlowDesignService', error);
    throw error;
  }
};

export const duplicateFlowDesignService = async (
  flowDesignId: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await axiosInstance.post(`/flow-designs/${flowDesignId}/duplicate`);
    return response.data;
  } catch (error) {
    console.error('Error in flowService/duplicateFlowDesignService', error);
    throw error;
  }
};

export const getFlowDesignDetailService = async (
  flowDesignId: string
): Promise<ApiResponse<FlowData>> => {
  try {
    const response = await axiosInstance.get(`/flow-designs/${flowDesignId}/node`);
    return response.data;
  } catch (error) {
    console.error('Error in flowService/getFlowDesignDetailService', error);
    throw error;
  }
};

export const updateFlowNodeService = async (
  flowDesignId: string,
  flowData: FlowData,
  status: string
): Promise<ApiResponse<FlowData>> => {
  try {
    const postBody = {
      nodes: flowData.nodes,
      edges: flowData.edges,
      status
    };

    const response = await axiosInstance.post(`/flow-designs/${flowDesignId}/edit`, postBody);
    return response.data;
  } catch (error) {
    console.error('Error in flowService/updateFlowNodeService', error);
    throw error;
  }
};
