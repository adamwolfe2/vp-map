'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
                <Button
                    variant="secondary"
                    onClick={onStartDraw}
                    className="shadow-md bg-white hover:bg-slate-50 text-slate-700"
                >
                    <Pentagon className="mr-2 h-4 w-4" />
                    Draw Territory
                </Button>
            </div>
        );
    }

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-10">
            <Card className="p-2 shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                {isDrawing && !hasShape && (
                    <div className="px-3 text-sm font-medium text-slate-600 animate-pulse">
                        Click map to draw polygon...
                    </div>
                )}

                {hasShape && (
                    <Button
                        size="sm"
                        onClick={onSave}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                    </Button>
                )}

                <Button
                    size="sm"
                    variant="ghost"
                    onClick={hasShape ? onClear : onCancel}
                    className="text-slate-500 hover:text-red-600 hover:bg-red-50"
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
            </Card>
        </div>
    );
}
