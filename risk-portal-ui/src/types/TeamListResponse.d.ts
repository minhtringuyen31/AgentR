import { ITeam } from "./Team";

export interface TeamListResponse {
  count: number;
  next: string;
  previous: string;
  results: ITeam[];
}
