import {
  addContactsToList,
  createContactList,
  deleteLists,
  removeContactsFromList,
  updateLists
} from '@/services/apis/ContactList';
import { ICreateContactListPayload, IUpdateContactListPayload } from '../types/ContactList';

const useMutateContactList = () => {
  const createList = async (payload: ICreateContactListPayload) => {
    try {
      await createContactList(payload);
      return true;
    } catch (error) {
      console.error('Error in createList', error);
      return false;
    }
  };

  const addToList = async (listId: string, contactIds: string[]) => {
    try {
      await addContactsToList(listId, contactIds);
      return true;
    } catch (error) {
      console.error('Error in addToList', error);
      return false;
    }
  };

  const removeFromList = async (listId: string, contactIds: string[]) => {
    try {
      await removeContactsFromList(listId, contactIds);
      return true;
    } catch (error) {
      console.error('Error in removeFromList', error);
      return false;
    }
  };

  const bulkDeleteLists = async (listId: string[]) => {
    try {
      await deleteLists(listId);
      return true;
    } catch (error) {
      console.error('Error in bulkDeleteLists', error);
      return false;
    }
  };

  const bulkUpdateLists = async (listId: string[], payload: IUpdateContactListPayload) => {
    try {
      await updateLists(listId, payload);
      return true;
    } catch (error) {
      console.error('Error in bulkUpdateLists', error);
      return false;
    }
  };

  return {
    addToList,
    removeFromList,
    createList,
    bulkDeleteLists,
    bulkUpdateLists
  };
};

export { useMutateContactList };
