'use client';

import { useState, useEffect } from 'react';
import { VendingpreneurClient } from '@/lib/types';

interface DebugOverlayProps {
    clients: VendingpreneurClient[];
    geocodingQueueSize: number;
    geocodedCount: number;
}

export default function DebugOverlay({ clients, geocodingQueueSize, geocodedCount }: DebugOverlayProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [lastError, setLastError] = useState<string | null>(null);

    useEffect(() => {
        const originalConsoleWarn = console.warn;
        console.warn = (...args) => {
            if (args[0] && typeof args[0] === 'string' && args[0].includes('[Geo]')) {
                setLastError(args.join(' '));
            }
            originalConsoleWarn.apply(console, args);
        };
        return () => {
            console.warn = originalConsoleWarn;
        };
    }, []);

    if (!isVisible) return <button onClick={() => setIsVisible(true)} className="fixed bottom-1 left-1 z-[100] text-xs opacity-50">🐞</button>;

    const totalLocations = clients.reduce((acc, c) => acc + (c.locations?.length || 0), 0);
    const mappedLocations = clients.reduce((acc, c) =>
        acc + (c.locations?.filter(l => l.latitude && l.longitude).length || 0), 0
    ) + geocodedCount;

    return (
        <div className="fixed bottom-20 left-4 z-[100] bg-black/80 text-white p-4 rounded-md text-xs font-mono max-w-sm">
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-yellow-400">DEBUG PANEL</span>
                <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-1">
                <div>Clients Fetched: <span className="text-green-400">{clients.length}</span></div>
                <div>Total Locations: <span className="text-blue-400">{totalLocations}</span></div>
                <div>Mapped (Has Coords): <span className="text-purple-400">{mappedLocations}</span></div>
                <div>Geocoding Queue: <span className="text-orange-400">{geocodingQueueSize}</span></div>
                <div>Geocoded Cache: <span className="text-cyan-400">{geocodedCount}</span></div>

                {lastError && (
                    <div className="mt-2 pt-2 border-t border-gray-700 text-red-400 break-words">
                        Last Error: {lastError}
                    </div>
                )}
            </div>
        </div>
    );
}
