import axios from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest } from './types';

const API_URL = process.env.REACT_APP_API_URL;

// Add auth interceptor
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        localStorage.setItem('token', response.data.token);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await axios.post(`${API_URL}/auth/register`, data);
        localStorage.setItem('token', response.data.token);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },
}; 