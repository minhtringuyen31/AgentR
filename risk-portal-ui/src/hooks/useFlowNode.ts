import { useState, useEffect } from 'react';
import {
  getFlowDesignDetailService,
  updateFlowNodeService
} from '../services/apis/Flow/flowService';
import { FlowData } from '../types/FlowData';

type ApiState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
};

export const useFlowNode = (flowDesignId: string) => {
  const [state, setState] = useState<ApiState<FlowData>>({
    data: null,
    error: null,
    isLoading: true
  });

  const fetchFlowNode = async () => {
    setState({ data: null, error: null, isLoading: true });
    try {
      const response = await getFlowDesignDetailService(flowDesignId);
      setState({ data: response.data, error: null, isLoading: false });
    } catch (err: unknown) {
      let errorMessage = 'Error fetching data';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setState({
        data: null,
        error: errorMessage,
        isLoading: false
      });
    }
  };

  const updateFlowNode = async (id: string, flowData: FlowData, status: string) => {
    try {
      const response = await updateFlowNodeService(id, flowData, status);
      setState({
        data: response.data,
        error: null,
        isLoading: false
      });
    } catch (err) {
      console.error('Error in updateFlowNode', err);
    }
  };

  useEffect(() => {
    fetchFlowNode();
  }, [flowDesignId]);

  return {
    ...state,
    updateFlowNode
  };
};
