import useSWR from 'swr';
import { getRoleList } from '@/services/apis/Role/roleService';
import { IRole } from '@/types/Role';

const fetcher = async (): Promise<IRole[]> => {
  const response = await getRoleList();
  return response.data;
};

export const useRoles = () => {
  const { data, error, isLoading } = useSWR([`/api/roles`], () => fetcher());

  return {
    rolesData: data,
    error,
    isLoading

    // Add other method
  };
};
