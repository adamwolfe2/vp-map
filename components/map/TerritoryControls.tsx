'use client';

import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Pentagon, Trash2, Save, X } from 'lucide-react';

// We'll define a simpler interface for the Draw control interaction
// to avoid deep coupling with the specific Draw library types in props
interface TerritoryControlsProps {
    isDrawing: boolean;
    hasShape: boolean;
    onStartDraw: () => void;
    onClear: () => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function TerritoryControls({
    isDrawing,
    hasShape,
    onStartDraw,
    onClear,
    onSave,
    onCancel
}: TerritoryControlsProps) {

    if (!isDrawing && !hasShape) {
        return (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-10">
                <GlassCard animated={true} className="p-1">
                    <Button
                        variant="ghost"
                        onClick={onStartDraw}
                        className="text-slate-700 dark:text-slate-200 hover:bg-white/10"
                    >
                        <Pentagon className="mr-2 h-4 w-4" />
                        Draw Territory
                    </Button>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-10">
            <GlassCard animated={true} className="p-2 flex items-center gap-2">
                {isDrawing && !hasShape && (
                    <div className="px-3 text-sm font-medium text-slate-600 dark:text-slate-300 animate-pulse">
                        Click map to draw polygon...
                    </div>
                )}

                {hasShape && (
                    <Button
                        size="sm"
                        onClick={onSave}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                    </Button>
                )}

                <Button
                    size="sm"
                    variant="ghost"
                    onClick={hasShape ? onClear : onCancel}
                    className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 dark:text-slate-400"
                >
                    {hasShape ? (
                        <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear
                        </>
                    ) : (
                        <>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </>
                    )}
                </Button>
            </GlassCard>
        </div>
    );
}
