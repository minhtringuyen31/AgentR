export interface BasicEvent {
  id: string;
  name: string;
  timeStart: string;
  timeEnd: string;
}

export interface CalendarData {
  date: string;
  eventsAmount: number;
  events: BasicEvent[];
}
