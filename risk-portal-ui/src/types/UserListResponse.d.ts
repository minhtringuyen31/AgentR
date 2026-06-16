import { IUser } from "./User";

export interface UserListResponse {
  count: number;
  next: string;
  previous: string;
  results: IUser[];
}
