import { useState, useEffect } from 'react';
import { getFlowTriggerListService } from '../services/apis/Flow/flowService';
import { FlowTrigger } from '../types/FlowData';
import { ListResponse } from '@/types/ListResponse';

type ApiState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

const useFlowTrigger = () => {
  const [state, setState] = useState<ApiState<ListResponse<FlowTrigger>>>({
    data: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      setState({ data: null, error: null, loading: true });
      const response = await getFlowTriggerListService();
      setState({ data: response.data, error: null, loading: false });
    };

    fetchData();
  }, []);

  return state;
};

export { useFlowTrigger };
