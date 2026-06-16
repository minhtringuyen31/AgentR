import { useEffect, useState } from 'react';
import { IPaginatedContactListsResponse } from '../types/ContactList';
import { getPaginatedContactLists } from '@/services/apis/ContactList';

interface IContactListQueryParams {
  page: number;
  limit: number;
  searchKeyword: string;
}

const useQueryContactList = (params: IContactListQueryParams) => {
  const [data, setData] = useState<IPaginatedContactListsResponse>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);
  const [revalidateKey, setRevalidateKey] = useState(0);

  useEffect(() => {
    fetcher(params);
  }, [JSON.stringify(params), revalidateKey]);

  const fetcher = async (payload: IContactListQueryParams): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await getPaginatedContactLists({
        page: payload.page,
        limit: payload.limit,
        search: payload.searchKeyword
      });

      setData(response.data);
    } catch (error) {
      setError(error);
    }
    setIsLoading(false);
  };

  const revalidate = () => {
    setRevalidateKey(revalidateKey + 1);
  };

  return {
    contactListsData: data,
    error,
    isLoading,
    revalidate
  };
};

export { useQueryContactList };
