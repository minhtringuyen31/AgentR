export interface BookingQueryParam {
  search?: string;
  category_id?: string;
  status?: string;
  team_id?: string;
  staff_id?: string;
  start_date?: string;
  end_date?: string;
  date_page?: number;
  date_limit?: string;
  event_limit?: string;
}
