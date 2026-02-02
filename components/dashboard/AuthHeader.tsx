'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCircle, LogIn } from 'lucide-react';

export default function AuthHeader() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    return (
        <div className="bg-white/90 backdrop-blur rounded-lg shadow-sm border p-2 flex items-center justify-between gap-2 mt-2 w-full md:w-96">
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="text-xs font-medium text-slate-600">
                    {isAuthenticated ? `Hi, ${user?.firstName || 'User'}` : 'Guest View'}
                </span>
            </div>

            {isAuthenticated ? (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => router.push('/portal')}>
                    <UserCircle className="h-3 w-3 mr-1" />
                    My Portal
                </Button>
            ) : (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => router.push('/login')}>
                    <LogIn className="h-3 w-3 mr-1" />
                    Login
                </Button>
            )}
        </div>
    );
}
