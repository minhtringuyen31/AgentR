export interface UserBody {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  vendor?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  countryCode?: string;
  avatar?: string;
  whatsappId?: string;
  subjectId?: string;
  position?: string;
  teams?: string[];
}
