import { EventDate } from "./DateEvent";

export interface BookingFilter {
  total_days: number;
  page: number;
  limit: number;
  data: EventDate[];
}

export interface BookingBody {
  title: string;
  contact_id: string;
  user_id: string;
  team_id: string;
  category_id: string;
  description: string;
  status: string;
  start_at: string;
  end_at: string;
}

export interface Booking {
  id: string;
  user: {
    id: string;
    role: Role;
    vendor: Vendor;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  contact: Contact;
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
