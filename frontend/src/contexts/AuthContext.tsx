import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: any | null;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        name,
      });

      setUser(response.data.user);
      // Store token
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, register, login, logout, isEmailVerified }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 