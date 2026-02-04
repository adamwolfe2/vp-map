import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    intensity?: 'low' | 'medium' | 'high';
    animated?: boolean;
}

export function GlassCard({ children, className, intensity = 'medium', animated = false, ...props }: GlassCardProps) {
    const { theme } = useTheme();

    const intensityStyles = {
        low: 'backdrop-blur-sm',
        medium: 'backdrop-blur-md',
        high: 'backdrop-blur-xl',
    };

    const bgStyles = theme === 'dark'
        // Deeper, richer dark background with a subtle gradient and stronger border
        ? 'bg-slate-950/70 border-white/5 hover:border-white/10 shadow-xl shadow-black/20 ring-1 ring-white/5'
        : 'bg-white/70 border-white/20 hover:border-white/40 shadow-xl shadow-slate-200/50';

    const animationStyles = animated
        ? 'animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out'
        : '';

    return (
        <div
            className={cn(
                'rounded-xl border transition-all duration-300 shadow-lg',
                intensityStyles[intensity],
                bgStyles,
                animationStyles,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
