'use client';

import { useEffect, useState } from 'react';

interface LiveIndicatorProps {
    lastUpdated?: Date | null;
    showLabel?: boolean;
    className?: string;
}

export function LiveIndicator({ lastUpdated, showLabel = true, className = '' }: LiveIndicatorProps) {
    const [justUpdated, setJustUpdated] = useState(false);

    // Trigger ripple effect when lastUpdated changes
    useEffect(() => {
        if (!lastUpdated) return;

        // Only if updated in last 5 seconds
        const now = new Date();
        const diff = now.getTime() - lastUpdated.getTime();

        if (diff < 5000) {
            setJustUpdated(true);
            const timer = setTimeout(() => setJustUpdated(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [lastUpdated]);

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative flex h-3 w-3">
                {justUpdated && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            {showLabel && (
                <span className={`text-xs font-semibold ${justUpdated ? 'text-green-600 transition-colors' : 'text-slate-500'}`}>
                    {justUpdated ? 'LIVE UPDATE' : 'Live Data'}
                </span>
            )}
        </div>
    );
}
