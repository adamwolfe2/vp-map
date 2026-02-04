'use client';

import { useState } from 'react';
import { VendingpreneurClient, Machine } from '@/lib/types';
import { MapPin, DollarSign, Box, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InventoryPanel from '@/components/dashboard/InventoryPanel';

interface LocationGalleryProps {
    client: VendingpreneurClient;
}

export default function LocationGallery({ client }: LocationGalleryProps) {
    const locations = client.locations || [];
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

    if (locations.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                No active locations data available.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {locations.length} Active Locations
            </h3>

            <div className="grid gap-3">
                {locations.map((loc, idx) => (
                    <GlassCard key={idx} className="overflow-hidden hover:shadow-lg transition-all bg-slate-800/50 border-white/5 hover:border-white/20 group">
                        <CardContent className="p-0 flex">
                            {/* Placeholder Image Section (for Phase 6) */}
                            <div className="w-24 bg-slate-900/50 flex items-center justify-center shrink-0 border-r border-white/5">
                                <MapPin className="h-6 w-6 text-slate-600 group-hover:text-blue-400 transition-colors" />
                            </div>

                            <div className="p-3 flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2 overflow-hidden pr-2">
                                        {/* Status Dot */}
                                        {(() => {
                                            const issue = loc.machines?.find(m => m.status !== 'Online');
                                            let color = 'bg-emerald-500'; // Default Online
                                            if (issue?.status === 'Error' || issue?.status === 'Offline') color = 'bg-red-500 animate-pulse';
                                            else if (issue?.status === 'LowStock') color = 'bg-yellow-500';

                                            return <div className={`h-2 w-2 rounded-full shrink-0 ${color}`} title={issue ? issue.status : 'All Online'} />;
                                        })()}
                                        <h4 className="font-medium text-sm truncate text-white group-hover:text-blue-300 transition-colors" title={loc.address}>
                                            {loc.address || 'Unknown Address'}
                                        </h4>
                                    </div>
                                    {loc.machineType && (
                                        <Badge variant="secondary" className="text-[10px] h-5 bg-slate-700 text-slate-300">
                                            {loc.machineType}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3 text-emerald-500" />
                                        <span className="font-medium text-slate-300">
                                            ${(loc.monthlyRevenue || 0).toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-slate-500">/mo</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <Box className="h-3 w-3" />
                                        <span>{loc.machinesCount || 1} machines</span>
                                    </div>
                                </div>

                                {/* Inventory Action */}
                                <div className="mt-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full h-7 text-xs border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                                        onClick={() => {
                                            const machine = loc.machines?.[0]; // Select primary machine
                                            if (machine) setSelectedMachine(machine);
                                        }}
                                    >
                                        <Layers className="h-3 w-3 mr-2" />
                                        View Inventory
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </GlassCard>
                ))}
            </div>

            {/* Inventory Modal */}
            <Dialog open={!!selectedMachine} onOpenChange={(open) => !open && setSelectedMachine(null)}>
                <DialogContent className="max-w-4xl p-0 bg-transparent border-none overflow-hidden h-[80vh]">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Machine Inventory</DialogTitle>
                    </DialogHeader>
                    {selectedMachine && <InventoryPanel machine={selectedMachine} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
