'use client';

import { ExtendedLocation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Navigation, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RoutePanelProps {
    selectedStops: ExtendedLocation[];
    onOptimize: () => void;
    onClear: () => void;
    onRemoveStop: (id: string) => void;
    isOptimized: boolean;
    routeStats?: {
        distance: string;
        duration: string;
    };
}

export default function RoutePanel({
    selectedStops,
    onOptimize,
    onClear,
    onRemoveStop,
    isOptimized,
    routeStats
}: RoutePanelProps) {
    if (selectedStops.length === 0) return null;

    return (
        <GlassCard animated={true} className="absolute top-20 left-4 z-10 w-80 p-0 overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
            <div className="py-3 px-4 border-b border-white/10 flex flex-col gap-2 backdrop-blur-md bg-white/5">
                <div className="flex flex-row items-center justify-between">
                    <div className="text-sm font-semibold flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-blue-400" />
                        <span className="dark:text-white text-slate-800">Route Planner</span>
                        <Badge variant="outline" className="ml-1 text-xs border-blue-500/30 text-blue-500">{selectedStops.length}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10" onClick={onClear}>
                        <X className="h-4 w-4 text-slate-400" />
                    </Button>
                </div>

                {/* Phase 15: Route Stats */}
                {isOptimized && routeStats && (
                    <div className="flex items-center justify-between px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20">
                        <div className="text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Distance:</span>
                            <span className="ml-1 font-bold text-slate-800 dark:text-white">{routeStats.distance}</span>
                        </div>
                        <div className="text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Time:</span>
                            <span className="ml-1 font-bold text-slate-800 dark:text-white">{routeStats.duration}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                <div className="space-y-1">
                    {selectedStops.map((stop, index) => (
                        <div
                            key={stop.id}
                            className="group flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-all cursor-pointer"
                        >
                            <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${index === 0 ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200'
                                }`}>
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-slate-800 dark:text-slate-100 text-sm">{stop.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{stop.address}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-red-500/20"
                                onClick={() => onRemoveStop(stop.id)}
                            >
                                <X className="h-3 w-3 text-red-400" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-3 border-t border-white/10 bg-white/5 backdrop-blur-md">
                <Button
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    onClick={onOptimize}
                    disabled={selectedStops.length < 2 || isOptimized}
                >
                    {isOptimized ? 'Route Optimized' : 'Optimize Route'}
                </Button>
            </div>
        </GlassCard >
    );
}
