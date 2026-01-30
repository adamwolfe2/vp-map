'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-semibold">Something went wrong!</h2>
                <p className="text-muted-foreground max-w-md">
                    {error.message || 'An unexpected error occurred while loading the map.'}
                </p>
                <div className="space-x-2">
                    <Button onClick={reset}>Try again</Button>
                    <Button variant="outline" onClick={() => window.location.href = '/'}>
                        Reload page
                    </Button>
                </div>
            </div>
        </div>
    );
}
