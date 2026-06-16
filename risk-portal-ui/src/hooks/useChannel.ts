import { useState, useEffect } from 'react';
import {
  getChannelListService,
  deleteChannelService
} from '@/services/apis/Channel/channelService';
import { ListResponse } from '@/types/ListResponse';
import { IChannel } from '@/types/Channel';

type ApiState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

const useChannel = () => {
  const [state, setState] = useState<ApiState<ListResponse<IChannel>>>({
    data: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    getChannelList();
  }, []);

  const getChannelList = async () => {
    setState({ data: null, error: null, loading: true });
    try {
      const response = await getChannelListService();
      setState({ data: response.data, error: null, loading: false });
    } catch (error: any) {
      setState({
        data: null,
        error: error.message || 'Failed to fetch data',
        loading: false
      });
    }
  };

  const deleteChannel = async (id: string) => {
    try {
      await deleteChannelService(id);
      // Re-fetch the channel list after successful deletion
      // getChannelList();
    } catch (error: any) {
      setState((prevState) => ({
        ...prevState,
        error: error.message || 'Failed to delete channel',
        loading: false
      }));
    }
  };

  return { ...state, deleteChannel };
};

export { useChannel };
