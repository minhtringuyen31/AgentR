import { useState, useEffect } from 'react';
import {
  getCurrentUser,
  signIn,
  fetchAuthSession,
  signOut,
  signUp,
  resetPassword,
  confirmResetPassword,
  confirmSignUp
} from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { RegistrationData } from '../types/RegistrationData';
import { createUserService, getUserInfoService } from '../services/apis/User/userService';
import { User } from '../types/User';
import '../amplifyConfig.ts'; // Import Amplify configuration
import { Register } from '../services/apis/Register/registerService';
import { useAuthProvider } from '@/context/AuthContext.tsx';

const useAuth = () => {
  const navigate = useNavigate();
  const { registerData, setRegisterData } = useAuthProvider();

  const getInitialAuthState = () => {
    const token = localStorage.getItem('idToken');
    return !!token;
  };

  const getAmplifyAuthState = () => {
    return getCurrentUser()
      .then(() => true)
      .catch(() => false);
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(getInitialAuthState);
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Cai nay co the dung thu vien amplify de handle viec refresh token va re-authenticate voi lai AWS
  // TODO: Sao ko dung useSWR o cho nay theo coding guideline?
  useEffect(() => {
    if (isAuthenticated) {
      setUserInfo(getUserInfo());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    getAmplifyAuthState().then((authState: any) => setIsAuthenticated(authState));
  }, []);

  // Loading user info tu cache ko phai la good practice, nen apdung useSWR cho nay cho caching ca refetch lai dung fetcher
  const getUserInfo = (): User | null => {
    const storedUserInfo = localStorage.getItem('USER_INFORMATION');
    if (storedUserInfo) {
      return JSON.parse(storedUserInfo) as User;
    }
    return null;
  };

  // TODO: tai sao function nay lai store login user theo dang array?
  // TODO: ko ro function nay dung de lam gi, logic kha kho hieu
  const checkAndStoreUser = (username: string): boolean => {
    const loggedInUsersString = localStorage.getItem('PREVIOUSLY_LOGGED_IN_USERS');
    const loggedInUsers: string[] = loggedInUsersString ? JSON.parse(loggedInUsersString) : [];

    if (!loggedInUsers.includes(username)) {
      loggedInUsers.push(username);
      localStorage.setItem('PREVIOUSLY_LOGGED_IN_USERS', JSON.stringify(loggedInUsers));
      return true;
    } else {
      return false;
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const user = await signIn({ username, password });
      const session = await fetchAuthSession();

      // Retrieve tokens
      const accessToken = session.tokens?.accessToken.toString() ?? '';
      const idToken = session.tokens?.idToken?.toString() ?? '';

      localStorage.setItem('idToken', idToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('username', username);

      let userInfo: any = {
        data: null
      };

      try {
        userInfo = await getUserInfoService();
      } catch (error: any) {
        if (error.status !== 200) {
          if (!registerData) {
            throw new Error('Missing data');
          }

          try {
            await Register(registerData);
          } catch (error: any) {
            throw new Error('Failed to create user');
          }
          userInfo = await getUserInfoService();
        }
      }

      localStorage.setItem('USER_INFORMATION', JSON.stringify(userInfo.data));

      const isTheFirstLogin = checkAndStoreUser(username);
      setIsFirstLogin(isTheFirstLogin);
      setIsAuthenticated(true); // Authenticate state nen dc luu o global state (useSWR) theo coding guideline
    } catch (err) {
      console.error('Error in login', err); // Logging error ko clear, ko ro error nay xuat phat tu function nao
      setError('Something went wrong. We are notified and will update shortly.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setUserInfo(null);

      // Call Logout API
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('USER_INFORMATION');
      navigate('/signin');
    } catch (err) {
      console.error('Error in logout', err);
      setError('Error logging out. Please try again.');
    }
  };

  const signup = async (registerData: RegistrationData) => {
    const { username, password, email } = registerData;
    try {
      await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email
          }
        }
      });
      localStorage.setItem('username', username);
      setRegisterData(registerData);
      navigate('/verify-email');
    } catch (err) {
      console.error('Error in signup', err);
      setError('Something went wrong. Please try again.');
    }
  };

  const createUser = async (registerData: RegistrationData) => {
    try {
      await createUserService(registerData);
      navigate('/signin');
    } catch (err) {
      console.error('Error in createUser', err);
      setError('Something went wrong. We are notified and will update shortly.');
    }
  };

  const forgotPassword = async (username: string) => {
    try {
      await resetPassword({ username });
      navigate('/reset-password');
    } catch (err) {
      console.error('Error in forgotPassword', err);
      setError('Something went wrong. Please try again.');
    }
  };

  const callResetPassword = async (
    username: string,
    confirmationCode: string,
    newPassword: string
  ) => {
    try {
      await confirmResetPassword({ username, confirmationCode, newPassword });
      navigate('/signin');
    } catch (err) {
      console.error('Error in resetPassword', err);
      setError('Something went wrong. Please try again.');
    }
  };

  const verifyCode = async (confirmationCode: string): Promise<string> => {
    try {
      const username = localStorage.getItem('username');
      if (!username || !confirmationCode) {
        throw new Error('Username and verification code are required.');
      }

      // Confirm the sign-up process using Amplify
      await confirmSignUp({ username, confirmationCode });
      return 'Verify code successfully';
    } catch (err: any) {
      console.error('Error verifying code:', err);
      throw new Error(err.message || 'Failed to verify the code. Please try again.');
    }
  };

  return {
    isAuthenticated,
    userInfo,
    isFirstLogin,
    loading,
    error,
    login,
    logout,
    signup,
    createUser,
    callResetPassword,
    forgotPassword,
    getUserInfo,
    verifyCode
  };
};

export default useAuth;
