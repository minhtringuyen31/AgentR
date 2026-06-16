import useSWR, { mutate } from 'swr';
import { v4 as uuidv4 } from 'uuid';
import {
  addTeamService,
  deleteBulkTeamService,
  getTeamListService,
  updateTeamService
} from '@/services/apis/Team/teamService';
import { TeamListResponse } from '@/types/TeamListResponse';

const fetcher = async (page: number, limit: number, keyword: string): Promise<TeamListResponse> => {
  const response = await getTeamListService(page, limit, keyword);
  return response.data;
};

export const useTeams = (page: number, limit: number, keyword: string) => {
  const { data, error, isLoading } = useSWR([`/api/teams`, page, limit, keyword], () =>
    fetcher(page, limit, keyword)
  );

  const addNewTeam = async (teamName: string) => {
    const body = {
      id: uuidv4(),
      name: teamName
    };
    try {
      await addTeamService(body);

      mutate([`/api/teams`, page, limit, keyword]);
    } catch (err) {
      console.error('Error in addNewTeam', err);
      throw err;
    }
  };

  const updateTeam = async (teamId: string, name: string) => {
    const postBody = {
      teamId: teamId,
      name: name
    };
    try {
      await updateTeamService(postBody);

      mutate([`/api/teams`, page, limit, keyword]);
    } catch (err) {
      console.error('Error in updateTeam', err);
      throw err;
    }
  };

  const deleteBulkTeam = async (teamIds: string[]) => {
    const postBody = {
      teamIds: teamIds
    };
    try {
      await deleteBulkTeamService(postBody);

      mutate([`/api/teams`, page, limit, keyword]);
    } catch (err) {
      console.error('Error in deleteBulkTeam', err);
      throw err;
    }
  };

  return {
    teamsData: data,
    error,
    isLoading,
    addNewTeam,
    updateTeam,
    deleteBulkTeam
  };
};
