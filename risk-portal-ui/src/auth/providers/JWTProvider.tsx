/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useEffect,
  useState
} from 'react';

import * as authHelper from '../_helpers';
import { type AuthModel, type UserModel } from '@/auth';
import { RegistrationData } from '@/types/RegistrationData';
import { IUser } from '@/types/User';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'abc@123';

const MOCK_USER: IUser = {
  id: '1',
  username: 'admin',
  email: 'admin@riskteam.vn',
  firstName: 'Admin',
  lastName: 'User',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
  countryCode: 'VN',
  avatar: '',
  whatappId: '',
  subjectId: '1',
  vendor: '',
  position: 'Risk Strategist',
  role: { id: '1', roleName: 'Admin' },
  teams: []
};

interface AuthContextProps {
  isLoading: boolean;
  auth: AuthModel | undefined;
  saveAuth: (auth: AuthModel | undefined) => void;
  currentUser: IUser | undefined;
  setCurrentUser: Dispatch<SetStateAction<IUser | undefined>>;
  login: (username: string, password: string) => Promise<void>;
  register: (registerData: RegistrationData) => Promise<void>;
  verifyEmailForRegister: (
    confirmationCode: string,
    registerData: RegistrationData
  ) => Promise<void>;
  createUser: (registerData: RegistrationData) => Promise<void>;
  forgotPassword: (username: string) => Promise<void>;
  callResetPassword: (
    username: string,
    confirmationCode: string,
    newPassword: string
  ) => Promise<void>;
  requestPassword: (email: string) => Promise<void>;
  getUser: () => Promise<IUser>;
  logout: () => void;
  verify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<IUser | undefined>();

  // Restore session from localStorage on mount
  const verify = async () => {
    if (auth) {
      setCurrentUser(MOCK_USER);
    }
  };

  useEffect(() => {
    verify().finally(() => {
      // delay for layout initialization
      setLoading(false);
    });
  }, []);

  // Set auth object and save it to local storage
  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  // Login user with hardcoded credentials check
  const login = async (username: string, password: string) => {
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      saveAuth(undefined);
      throw new Error('Invalid username or password');
    }
    saveAuth({ accessToken: 'mock-token', idToken: 'mock-id-token', username });
    setCurrentUser(MOCK_USER);
  };

  const register = async (_registerData: RegistrationData) => {
    throw new Error('Registration is not supported.');
  };

  const verifyEmailForRegister = async (
    _confirmationCode: string,
    _registerData: RegistrationData
  ) => {
    throw new Error('Email verification is not supported.');
  };

  const createUser = async (_registerData: RegistrationData) => {
    throw new Error('User creation is not supported.');
  };

  const forgotPassword = async (_username: string) => {
    throw new Error('Forgot password is not supported.');
  };

  const callResetPassword = async (
    _username: string,
    _confirmationCode: string,
    _newPassword: string
  ) => {
    throw new Error('Reset password is not supported.');
  };

  const requestPassword = async (_email: string) => {
    throw new Error('Request password is not supported.');
  };

  const getUser = async (): Promise<IUser> => {
    return MOCK_USER;
  };

  const logout = () => {
    saveAuth(undefined);
    setCurrentUser(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading: loading,
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        login,
        register,
        verifyEmailForRegister,
        createUser,
        forgotPassword,
        callResetPassword,
        requestPassword,
        getUser,
        logout,
        verify
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
