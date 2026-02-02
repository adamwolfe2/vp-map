'use client';

import { ExtendedLocation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RoutePanelProps {
    selectedStops: ExtendedLocation[];
    onOptimize: () => void;
    onClear: () => void;
    onRemoveStop: (id: string) => void;
    isOptimized: boolean;
}

export default function RoutePanel({
    selectedStops,
    onOptimize,
    onClear,
    onRemoveStop,
    isOptimized
}: RoutePanelProps) {
    if (selectedStops.length === 0) return null;

    return (
        <Card className="absolute top-20 left-4 z-10 w-80 shadow-xl border-slate-200">
            <CardHeader className="py-3 px-4 border-b bg-slate-50 rounded-t-lg flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    Route Planner
                    <Badge variant="secondary" className="ml-1 text-xs">{selectedStops.length}</Badge>
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClear}>
                    <X className="h-4 w-4 text-slate-400" />
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-[200px] p-2 overflow-y-auto">
                    <div className="space-y-1">
                        {selectedStops.map((stop, index) => (
                            <div
                                key={stop.id}
                                className="group flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 text-sm border border-transparent hover:border-slate-200 transition-all"
                            >
                                <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate text-slate-800">{stop.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{stop.address}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                    onClick={() => onRemoveStop(stop.id)}
                                >
                                    <X className="h-3 w-3 text-red-400 hover:text-red-600" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-3 border-t bg-slate-50 rounded-b-lg">
                    <Button
                        className="w-full"
                        onClick={onOptimize}
                        disabled={selectedStops.length < 2 || isOptimized}
                    >
                        {isOptimized ? 'Route Optimized' : 'Optimize Route'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
