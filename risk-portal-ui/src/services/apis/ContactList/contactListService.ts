import {
  ICreateContactListPayload,
  IPaginatedContactListsResponse,
  IUpdateContactListPayload
} from '@/types/ContactList';
import { ApiResponse } from '@/types/ApiResponse';
import axiosInstance from '../axiosInstance';

interface IContactListQueryParams {
  page: number;
  limit: number;
  search: string;
}

const getPaginatedContactLists = async (
  params: IContactListQueryParams
): Promise<ApiResponse<IPaginatedContactListsResponse>> => {
  try {
    const response = await axiosInstance.get('/contact-lists', { params });
    return response.data;
  } catch (error) {
    console.error('Error in getPaginatedContactLists', error);
    throw error;
  }
};

const createContactList = async (payload: ICreateContactListPayload) => {
  try {
    const response = await axiosInstance.post('/contact-lists', payload);
    return response.data;
  } catch (error) {
    console.error('Error in createContactList', error);
    throw error;
  }
};

const addContactsToList = async (listId: string, contactIds: string[]) => {
  try {
    const response = await axiosInstance.patch(`/contact-lists/${listId}/add-contacts`, {
      contactIds
    });
    return response.data;
  } catch (error) {
    console.error('Error in addContactToList', error);
    throw error;
  }
};

const removeContactsFromList = async (listId: string, contactIds: string[]) => {
  try {
    const response = await axiosInstance.patch(`/contact-lists/${listId}/remove-contacts`, {
      contactIds
    });
    return response.data;
  } catch (error) {
    console.error('Error in removeContactFromList', error);
    throw error;
  }
};

const deleteLists = async (contactListIds: string[]) => {
  try {
    const response = await axiosInstance.delete('/contact-lists', {
      data: {
        contactListIds
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in deleteLists', error);
    throw error;
  }
};

const updateLists = async (contactListIds: string[], payload: IUpdateContactListPayload) => {
  try {
    const response = await axiosInstance.patch('/contact-lists', {
      contactListIds,
      payload
    });
    return response.data;
  } catch (error) {
    console.error('Error in updateLists', error);
    throw error;
  }
};

export {
  getPaginatedContactLists,
  addContactsToList,
  removeContactsFromList,
  createContactList,
  deleteLists,
  updateLists
};
