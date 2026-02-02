'use client';

import { VendingpreneurClient } from '@/lib/types';
import { MapPin, DollarSign, Box } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface LocationGalleryProps {
    client: VendingpreneurClient;
}

export default function LocationGallery({ client }: LocationGalleryProps) {
    const locations = [];

    // 1. Gather Sub-locations (1-5)
    for (let i = 1; i <= 5; i++) {
        // @ts-expect-error - Dynamic access to client property
        const address = client[`location${i}Address`];
        // @ts-expect-error - Dynamic access to client property
        const revenue = client[`location${i}MonthlyRevenue`];
        // @ts-expect-error - Dynamic access to client property
        const machines = client[`location${i}NumberOfMachines`];
        // @ts-expect-error - Dynamic access to client property
        const type = client[`location${i}MachineType`];

        if (address && address.length > 5) {
            locations.push({
                name: `Location ${i}`,
                address,
                revenue,
                machines,
                type
            });
        }
    }

    // 2. Gather Linked Locations
    if (client.linkedLocations) {
        client.linkedLocations.forEach((loc, idx) => {
            locations.push({
                name: `Linked Location ${idx + 1}`,
                address: loc.address || '',
                revenue: loc.monthlyRevenue,
                machines: loc.machinesCount,
                type: loc.machineType
            });
        });
    }

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
                    <Card key={idx} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0 flex">
                            {/* Placeholder Image Section (for Phase 6) */}
                            <div className="w-24 bg-slate-200 flex items-center justify-center shrink-0">
                                <MapPin className="h-6 w-6 text-slate-400" />
                            </div>

                            <div className="p-3 flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-medium text-sm truncate pr-2" title={loc.address}>
                                        {loc.address}
                                    </h4>
                                    {loc.type && (
                                        <Badge variant="secondary" className="text-[10px] h-5">
                                            {loc.type}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        <span className="font-medium text-slate-700">
                                            ${(loc.revenue || 0).toLocaleString()}
                                        </span>
                                        <span className="text-[10px]">/mo</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Box className="h-3 w-3" />
                                        <span>{loc.machines || 1} machines</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
