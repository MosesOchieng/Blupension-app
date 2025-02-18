import axios from 'axios';
import { DashboardData, Transaction } from '@/types/api';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface CreateTransactionParams {
  type: 'deposit' | 'withdrawal';
  amount: number;
  phoneNumber: string;
}

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const { data } = await api.get<DashboardData>('/api/dashboard');
  return data;
};

export const createTransaction = async (params: CreateTransactionParams): Promise<Transaction> => {
  const { data } = await api.post<Transaction>(`/api/transactions/${params.type}`, params);
  return data;
};

export const fetchTransactions = async (page = 1, limit = 10): Promise<{
  transactions: Transaction[];
  total: number;
}> => {
  const { data } = await api.get(`/api/transactions`, {
    params: { page, limit },
  });
  return data;
};

export const fetchWithdrawalLimits = async () => {
  const { data } = await api.get('/api/transactions/withdrawal-limits');
  return data;
};

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/api/auth/login', {
    email,
    password,
  });
  return data;
};

export const register = async (data: { 
  email: string; 
  password: string; 
  name: string; 
}) => {
  try {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || 
      'Registration failed. Please try again.'
    );
  }
};

export const verifyEmail = async (token: string): Promise<void> => {
  await api.post('/api/auth/verify-email', { token });
};

export const resendVerificationEmail = async (): Promise<void> => {
  await api.post('/api/auth/resend-verification');
};

export const resetPassword = async (email: string): Promise<void> => {
  await api.post('/api/auth/reset-password', { email });
};

export const updatePassword = async (
  token: string,
  password: string
): Promise<void> => {
  await api.post('/api/auth/update-password', { token, password });
}; 