import { ICreateContactPayload, IUpdateContactPayload } from '@/types/Contact';
import {
  createContact as createContactService,
  deleteContacts as deleteContactsService,
  updateContacts,
  updateSingleContact,
  updateLists as updateListsService
} from '@/services/apis/Contact/contactService';

/**
 * useMutateContact
 *
 * This hook provides functions to create, update or delete multiple contacts at once.
 *
 * @returns An object with functions to create, update and delete contacts.
 * - `createContact`: Creates a new contact with `ICreateContactPayload`.
 * - `bulkUpdateContacts`: Updates multiple contacts with `IUpdateContactPayload`.
 * - `bulkDeleteContacts`: Deletes multiple contacts by their IDs.
 *
 * All functions return a boolean indicating whether the operation was successful.
 */
const useMutateContact = () => {
  const createContact = async (payload: ICreateContactPayload) => {
    try {
      await createContactService(payload);
    } catch (err) {
      console.error('Error in createContact', err);
      throw err;
    }
  };

  const bulkDeleteContacts = async (contactIds: string[]) => {
    try {
      await deleteContactsService(contactIds);
    } catch (err) {
      console.error('Error in deleteContacts', err);
      throw err;
    }
  };

  const bulkUpdateContacts = async (contactIds: string[], payload: IUpdateContactPayload) => {
    try {
      await updateContacts(contactIds, payload);
    } catch (err) {
      console.error('Error in updateContacts', err);
      throw err;
    }
  };

  const updateContact = async (contactId: string, payload: IUpdateContactPayload) => {
    try {
      const response = await updateSingleContact(contactId, payload);
      return response.data;
    } catch (err) {
      console.error('Error in updateContact', err);
    }
  };

  const updateLists = async (contactId: string, contactListIds: string[]) => {
    try {
      await updateListsService(contactId, contactListIds);
    } catch (err) {
      console.error('Error in updateLists', err);
      throw err;
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      await deleteContactsService([contactId]);
    } catch (err) {
      console.error('Error in deleteContact', err);
      throw err;
    }
  };

  return {
    createContact,
    bulkUpdateContacts,
    bulkDeleteContacts,
    updateContact,
    updateLists,
    deleteContact
  };
};

export { useMutateContact };
