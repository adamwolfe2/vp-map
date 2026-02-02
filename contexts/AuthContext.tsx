'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { VendingpreneurClient } from '@/lib/types';
import { MOCK_DATA } from '@/lib/mock_data';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: VendingpreneurClient | null;
    isLoading: boolean;
    login: (email: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<VendingpreneurClient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check for persisted session on mount
    useEffect(() => {
        const storedUserId = localStorage.getItem('vp_map_user_id');
        if (storedUserId) {
            // Find user in mock data (simulating API lookup)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const foundUser = (MOCK_DATA as any[]).find(c => c.id === storedUserId);
            if (foundUser) {
                setUser(foundUser);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string): Promise<boolean> => {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock Login Logic: Case insensitive email match
        // In reality, this would trigger a Magic Link via email
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const foundUser = (MOCK_DATA as any[]).find(c =>
            (c.personalEmail && c.personalEmail.toLowerCase() === email.toLowerCase()) ||
            (c.businessEmail && c.businessEmail.toLowerCase() === email.toLowerCase())
        );

        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('vp_map_user_id', foundUser.id);
            setIsLoading(false);
            return true;
        }

        setIsLoading(false);
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('vp_map_user_id');
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            isAuthenticated: !!user
        }}>
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
