import { BookingCategory } from './BookingCategory';
import { IRole } from './Role';
import { Vendor } from './Vendor';

// export interface Event {
//   id: string;
//   title: string;
//   category: string;
//   customer: string;
//   staff: string;
//   team: string;
//   time: string;
//   status: string;
// }

export interface IEvent {
  id: string;
  user: {
    id: string;
    role: IRole;
    vendor: Vendor;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  contact: string;
  team: {
    id: string;
    name: string;
    vendor: string;
  };
  category: BookingCategory;
  title: string;
  description: string;
  status: string;
  start_at: string;
  end_at: string;
}
