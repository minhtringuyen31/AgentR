import { IUser } from './User';

interface IContactList {
  id: string;
  name: string;
  contacts_count: number;
  user: IUser;
  created_at: string;
}

interface ICreateContactListPayload {
  name: string;
}

interface IUpdateContactListPayload {
  name: string;
}

interface IPaginatedContactListsResponse {
  count: number;
  next: string;
  previous: string;
  results: IContactList[];
}

export {
  IContactList,
  IPaginatedContactListsResponse,
  ICreateContactListPayload,
  IUpdateContactListPayload
};
