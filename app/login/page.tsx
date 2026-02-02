'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Mail, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const success = await login(email);
            if (success) {
                toast.success('Magic link sent! Check your email.');
                // Simulate the user clicking the link
                setTimeout(() => {
                    toast.success('Successfully logged in!');
                    router.push('/portal');
                }, 1000);
            } else {
                toast.error('Email not found. Are you a registered Vendingpreneur?');
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">VendingPreneur</h1>
                    <p className="mt-2 text-slate-600">Map & Management Portal</p>
                </div>

                <Card className="shadow-xl border-t-4 border-t-primary">
                    <CardHeader>
                        <CardTitle className="text-xl">Sign In</CardTitle>
                        <CardDescription>
                            Enter your email to receive a secure magic link.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="pl-9"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting || !email}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending Link...
                                    </>
                                ) : (
                                    'Send Magic Link'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 flex items-start gap-3 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                            <Info className="h-5 w-5 shrink-0" />
                            <p>
                                <strong>Tip for Demo:</strong> Use an email from the map (e.g., <code>sarah@example.com</code>) to log in effectively.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
