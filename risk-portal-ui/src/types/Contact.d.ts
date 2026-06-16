import { IContactList } from './ContactList';
import { IUser } from './User';

interface IContact {
  id: string;
  vendor: string;
  whatsappId: string;
  name?: string;
  firstname?: string;
  lastname?: string;
  email: string;
  birthday?: string;
  gender?: string;
  contact_lists?: IContactList[];
  country_code?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  user?: IUser;
  created_at: string;
  updated_at: string;
  last_user_contacted_at?: string;
  last_customer_contacted_at?: string;
}

interface ICreateContactPayload {
  name: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  birthday?: string;
  gender?: string;
  phone: string;
  country_code: string;
  contact_lists?: string[];
  company?: string;
  job_title?: string;
  user: string;
}

interface IUpdateContactPayload {
  name?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  country_code?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  birthday?: string;
  gender?: string;
  user?: string;
}

interface IPaginatedContactsResponse {
  count: number;
  next: string;
  previous: string;
  results: IContact[];
}

export { IContact, ICreateContactPayload, IPaginatedContactsResponse, IUpdateContactPayload };
