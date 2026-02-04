'use client';

import { Machine, InventoryItem } from '@/lib/types';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryPanelProps {
    machine: Machine;
    onClose?: () => void;
}

export default function InventoryPanel({ machine, onClose }: InventoryPanelProps) {
    if (!machine.inventory) return <div className="p-4 text-white">No inventory data available.</div>;

    // Group by Row (A, B, C...)
    const rows: Record<string, InventoryItem[]> = {};

    if (machine.inventory) {
        machine.inventory.forEach(item => {
            const rowChar = item.slot.charAt(0);
            if (!rows[rowChar]) rows[rowChar] = [];
            rows[rowChar].push(item);
        });
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    };

    return (
        <GlassCard className="w-full h-full flex flex-col overflow-hidden bg-slate-900/90 border-slate-700">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {machine.type} Machine <span className="text-sm font-normal text-slate-400">({machine.serialNumber})</span>
                    </h3>
                    <div className="flex gap-2 mt-1">
                        <Badge variant={machine.status === 'Online' ? 'default' : 'destructive'} className="text-xs">
                            {machine.status}
                        </Badge>
                        <span className="text-xs text-slate-400 flex items-center">
                            Last Sync: {new Date(machine.lastHeartbeat).toLocaleTimeString()}
                        </span>
                    </div>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {Object.keys(rows).sort().map(rowKey => (
                        <div key={rowKey} className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Row {rowKey}</h4>
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                {rows[rowKey]?.map(item => {
                                    const fillPercent = (item.stock / item.capacity) * 100;
                                    let statusColor = "bg-emerald-500";
                                    if (fillPercent < 30) statusColor = "bg-red-500";
                                    else if (fillPercent < 60) statusColor = "bg-amber-500";

                                    return (
                                        <div key={item.slot} className="relative group">
                                            <div className={`
                                                relative overflow-hidden rounded-lg border border-white/5 bg-white/5 p-2 transition-all hover:bg-white/10
                                                ${fillPercent === 0 ? 'opacity-50 grayscale' : ''}
                                            `}>
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-mono text-slate-400">{item.slot}</span>
                                                    <span className="text-[10px] font-bold text-emerald-400">{formatPrice(item.price)}</span>
                                                </div>

                                                {/* Product Name */}
                                                <div className="h-8 flex items-center justify-center mb-2">
                                                    {/* Future: Image */}
                                                    <span className="text-[10px] font-medium text-center text-slate-200 leading-tight line-clamp-2">
                                                        {item.productName}
                                                    </span>
                                                </div>

                                                {/* Stock Bar */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[9px] text-slate-400 uppercase">
                                                        <span>Stock</span>
                                                        <span className={fillPercent < 30 ? "text-red-400 font-bold" : ""}>
                                                            {item.stock}/{item.capacity}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
                                                            style={{ width: `${fillPercent}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Low Stock Badges */}
                                                {fillPercent < 30 && (
                                                    <div className="absolute -top-1 -right-1">
                                                        <span className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm ring-2 ring-slate-900">
                                                            !
                                                        </span>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </GlassCard>
    );
}
