import { getPaginatedContacts } from '@/services/apis/Contact/contactService';
import { IPaginatedContactsResponse } from '@/types/Contact';
import { FilterEntry } from '@/types/Filters';
import { useEffect, useState } from 'react';

type IContactQueryParams = {
  page?: number;
  limit?: number;
  searchKeyword?: string;
  isOwnOnly?: boolean;
  filters?: FilterEntry[];
};

/**
 * Custom hook to fetch and manage contact data.
 *
 * @param {IContactQueryParams} params - Parameters for fetching contacts, including pagination, search keyword, and ownership filter.
 *
 * @returns {object} An object containing:
 * - `contactsData`: The fetched contacts data.
 * - `error`: Any error encountered during the fetch.
 * - `isLoading`: Boolean indicating whether the data is currently being loaded.
 * - `revalidate`: Function to manually trigger data re-fetch.
 */
export const useQueryContact = (params: IContactQueryParams) => {
  const [data, setData] = useState<IPaginatedContactsResponse>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);
  const [revalidateKey, setRevalidateKey] = useState<number>(0);

  useEffect(() => {
    fetcher(params);
  }, [JSON.stringify(params), revalidateKey]);

  const fetcher = async (params: IContactQueryParams): Promise<void> => {
    setIsLoading(true);
    try {
      const filterQuery = params.filters
        ?.map(
          (filter) =>
            filter.field && `${filter.field}:${filter.rule}=${encodeURI(filter.value as string)}`
        )
        .filter((filter) => !!filter)
        .join('&');
      const response = await getPaginatedContacts({
        page: params.page,
        limit: params.limit,
        search: params.searchKeyword,
        is_own_only: params.isOwnOnly,
        filters: filterQuery
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
    contactsData: data,
    error,
    isLoading,
    revalidate
  };
};
