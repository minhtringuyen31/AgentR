import useSWR, { mutate } from 'swr';
import {
  createFlowDesign,
  deleteFlowDesignService,
  duplicateFlowDesignService,
  getFlowDesignListService
} from '@/services/apis/Flow/flowService';
import { FlowDesign, FlowDesignBody } from '@/types/FlowData';
import { ListResponse } from '@/types/ListResponse';

const fetcher = async (
  page: number,
  limit: number,
  keyword: string,
  status: string
): Promise<ListResponse<FlowDesign>> => {
  const response = await getFlowDesignListService(page, limit, keyword, status);
  return response.data;
};

export const useFlowDesign = (page: number, limit: number, keyword: string, status: string) => {
  const { data, error, isLoading } = useSWR(
    [`/api/flow-design`, page, limit, keyword, status],
    () => fetcher(page, limit, keyword, status)
  );

  const createFlow = async (postBody: FlowDesignBody) => {
    try {
      await createFlowDesign(postBody);
      mutate([`/api/flow-design`, page, limit, keyword, status]);
    } catch (err) {
      console.error('Error in addUserToTeam', err);
    }
  };

  const deleteFlowDesign = async (flowDesignId: string) => {
    try {
      await deleteFlowDesignService(flowDesignId);

      mutate([`/api/flow-design`, page, limit, keyword, status]);
    } catch (err) {
      console.error('Error in deleteFlowDesign', err);
    }
  };

  const duplicateFlowDesign = async (flowDesignId: string) => {
    try {
      await duplicateFlowDesignService(flowDesignId);

      mutate([`/api/flow-design`, page, limit, keyword, status]);
    } catch (err) {
      console.error('Error in deleteFlowDesign', err);
    }
  };

  return {
    data,
    error,
    isLoading,
    createFlow,
    deleteFlowDesign,
    duplicateFlowDesign
  };
};
