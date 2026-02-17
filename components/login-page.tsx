'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">VendingPreneur</h1>
                    <p className="mt-2 text-slate-600">Map & Management Portal</p>
                </div>

                <Card className="shadow-xl border-t-4 border-t-primary">
                    <CardHeader>
                        <CardTitle className="text-xl">Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to access your Vendingpreneur dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={login}
                            className="w-full"
                            size="lg"
                        >
                            Sign In / Sign Up
                        </Button>

                        <div className="mt-6 flex items-start gap-3 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                            <Info className="h-5 w-5 shrink-0" />
                            <div className="space-y-1">
                                <p className="font-semibold">Demo Access:</p>
                                <p>
                                    Sign in (or sign up) with <code>demo@vendingpreneur.com</code> to see sample data.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
