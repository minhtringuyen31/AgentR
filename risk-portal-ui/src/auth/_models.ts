import { type LanguageCodeType } from '@/i18n';

export interface AuthModel {
  // access_token: string;
  // refreshToken?: string;
  // api_token: string;
  accessToken: string;
  idToken: string;
  username: string;
}

export interface UserModel {
  id: number;
  username: string;
  password: string | undefined;
  email: string;
  first_name: string;
  last_name: string;
  fullname?: string;
  occupation?: string;
  companyName?: string;
  phone?: string;
  roles?: number[];
  pic?: string;
  language?: LanguageCodeType;
  auth?: AuthModel;
}
