import { IRole } from './Role';
import { ITeam } from './Team';

export interface IUser {
  id: string;
  role: IRole;
  vendor: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  countryCode: string;
  avatar: string;
  whatappId: string;
  subjectId: string;
  username: string;
  position: string;
  teams: ITeam[];
}
