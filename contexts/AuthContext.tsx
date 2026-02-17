'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { VendingpreneurClient } from '@/lib/types';
import { MOCK_DATA } from '@/lib/mock_data';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: VendingpreneurClient | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
    const { signOut, openSignIn } = useClerk();
    const [appUser, setAppUser] = useState<VendingpreneurClient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (isClerkLoaded) {
            if (clerkUser) {
                // Find user in mock data by matching email
                const email = clerkUser.primaryEmailAddress?.emailAddress;
                if (email) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const foundUser = (MOCK_DATA as any[]).find(c =>
                        (c.personalEmail && c.personalEmail.toLowerCase() === email.toLowerCase()) ||
                        (c.businessEmail && c.businessEmail.toLowerCase() === email.toLowerCase())
                    );

                    if (foundUser) {
                        setAppUser(foundUser);
                        // Optional: Store ID for other components if needed, though relying on Context is better
                        localStorage.setItem('vp_map_user_id', foundUser.id);
                    } else {
                        console.warn('User logged in with Clerk but no matching profile found in mock data.');
                        setAppUser(null);
                    }
                }
            } else {
                setAppUser(null);
                localStorage.removeItem('vp_map_user_id');
            }
            setIsLoading(false);
        }
    }, [isClerkLoaded, clerkUser]);

    const login = () => {
        openSignIn();
    };

    const logout = async () => {
        await signOut();
        setAppUser(null);
        localStorage.removeItem('vp_map_user_id');
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{
            user: appUser,
            isLoading: isLoading || !isClerkLoaded,
            login,
            logout,
            isAuthenticated: !!appUser
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
