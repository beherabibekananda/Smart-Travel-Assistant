import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

interface User {
    id: number;
    email: string;
    name: string;
    age: number;
    diet_type: string;
    daily_food_budget: number;
    hotel_budget_per_night: number;
    is_active: boolean;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (userData: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                await fetchCurrentUser(token);
            } else {
                setLoading(false);
            }
        };
        initAuth();
    }, []); // Run only on mount

    const fetchCurrentUser = async (authToken: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setUser(response.data);
            // Store user ID for convenience
            localStorage.setItem('user_id', response.data.id.toString());
        } catch (error) {
            console.error('Failed to fetch user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
        const { access_token } = response.data;

        setToken(access_token);
        localStorage.setItem('token', access_token);
        await fetchCurrentUser(access_token);
    };

    const signup = async (userData: any) => {
        try {
            await axios.post(`${API_BASE_URL}/auth/signup`, userData);
            await login(userData.email, userData.password);
        } catch (error: any) {
            // If signup succeeds but login fails, throw a specific error
            if (error.response?.status === 401) {
                throw new Error('Account created successfully, but auto-login failed. Please try logging in manually.');
            }
            // Re-throw the original error
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
