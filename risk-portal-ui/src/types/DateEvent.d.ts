import { Booking } from './BookingData';

export interface DateEvent {
  id?: string;
  date?: string;
  total?: number;
  total_events?: number;
  max_event?: number;
  events: Booking[];
}
