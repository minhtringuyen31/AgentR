import useSWR, { mutate } from 'swr';
import { UserBody } from '../types/UserBody';
import {
  deleteBulkUserService,
  getUserListService,
  inviteUserService,
  updateBulkUserService,
  updateUserService
} from '@/services/apis/User/userService';
import {
  addUserToTeamService,
  removeUserFromTeamService,
  updateUserInTeamService
} from '@/services/apis/Team/teamService';
import { UserListResponse } from '@/types/UserListResponse';

const fetcher = async (
  page: number,
  limit: number,
  teamId: string,
  searchKeyword: string
): Promise<UserListResponse> => {
  const response = await getUserListService(page, limit, teamId, searchKeyword);
  return response.data;
};

export const useUser = (page: number, limit: number, teamId: string, keyword: string) => {
  const { data, error, isLoading } = useSWR([`/api/users`, page, limit, teamId, keyword], () =>
    fetcher(page, limit, teamId, keyword)
  );

  const inviteUser = async (emails: string[], role: string) => {
    try {
      const postBody = {
        emails: emails,
        role: role
      };
      await inviteUserService(postBody);
    } catch (err) {
      console.error('Error in inviteUser', err);
      throw err;
    }
  };

  const updateUser = async (userId: string, postBody: UserBody) => {
    try {
      console.log('Here');
      await updateUserService(userId, postBody);

      mutate([`/api/users`, page, limit, teamId, keyword]);
    } catch (err) {
      console.error('Error in updateUser', err);
      throw err;
    }
  };

  const addUserToTeam = async (userIds: string[], teamIds: string[]) => {
    try {
      const postBody = {
        userIds: userIds,
        teamIds: teamIds
      };
      await addUserToTeamService(postBody);

      mutate([`/api/users`, page, limit, teamId, keyword]);
    } catch (err) {
      console.error('Error in addUserToTeam', err);
      throw err;
    }
  };

  const removeUserFromTeam = async (userIds: string[], teamIds: string[]) => {
    try {
      const postBody = {
        userIds: userIds,
        teamIds: teamIds
      };
      await removeUserFromTeamService(postBody);

      mutate([`/api/users`, page, limit, teamId, keyword]);
    } catch (err) {
      console.error('Error in removeUserFromTeam', err);
      throw err;
    }
  };

  const updateUserInTeam = async (userIds: string[], teamIds: string[], action: string) => {
    try {
      const postBody = {
        userIds: userIds,
        teamIds: teamIds
      };
      await updateUserInTeamService(action, postBody);

      mutate([`/api/users`, page, limit, teamId, keyword]);
    } catch (err) {
      console.error('Error in updateUserInTeam', err);
      throw err;
    }
  };

  const updateBulkUser = async (
    userIds: string[],
    selectedProperty: string,
    inputValue: string
  ) => {
    try {
      await updateBulkUserService(userIds, selectedProperty, inputValue);
      mutate([`/api/users`, page, limit, teamId, keyword]);
    } catch (err) {
      console.error('Error in updateBulkUser', err);
      throw err;
    }
  };

  const deleteBulkUser = async (userIds: string[]) => {
    try {
      const postBody = {
        userIds: userIds
      };
      await deleteBulkUserService(postBody);
      mutate([`/api/users`, page, limit, teamId, keyword]);
    } catch (err) {
      console.error('Error in deleteBulkUser', err);
      throw err;
    }
  };

  return {
    usersData: data,
    error,
    isLoading,
    inviteUser,
    updateUser,
    addUserToTeam,
    removeUserFromTeam,
    updateUserInTeam,
    updateBulkUser,
    deleteBulkUser
  };
};
