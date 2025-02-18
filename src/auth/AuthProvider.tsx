import { createContext, useContext, useEffect, useState } from 'react';

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(true); // Temporarily set to true
    const [token, setToken] = useState('temporary_bypass_token');

    // Temporary: Set bypass token on mount
    useEffect(() => {
        localStorage.setItem('token', 'temporary_bypass_token');
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, token }}>
            {children}
        </AuthContext.Provider>
    );
} 