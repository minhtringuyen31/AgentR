import axios from 'axios';
import { getAuth } from '@/auth';

const agentInstance = axios.create({
  baseURL: import.meta.env.VITE_AGENT_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

agentInstance.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

export default agentInstance;
