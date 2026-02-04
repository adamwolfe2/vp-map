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
        ? 'bg-black/40 border-white/10 hover:border-white/20'
        : 'bg-white/60 border-black/5 hover:border-black/10';

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
