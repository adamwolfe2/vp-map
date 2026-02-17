import { GlassCard } from '@/components/ui/glass-card';
import { VendingpreneurClient } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Package, MapPin, DollarSign, Calendar } from 'lucide-react';

interface MetricsGridProps {
    client: VendingpreneurClient;
}

export default function MetricsGrid({ client }: MetricsGridProps) {
    // Phase 12: Derived Metrics Logic
    // Validates top-level rollups against detailed location data
    const locationCount = client.totalNumberOfLocations || client.locations?.length || 0;

    const machineCount = client.totalNumberOfMachines ||
        (client.locations || []).reduce((sum, loc) => sum + (loc.machinesCount || 0), 0);

    const revenueCount = client.totalMonthlyRevenue ||
        (client.locations || []).reduce((sum, loc) => sum + (loc.monthlyRevenue || 0), 0);

    const metrics = [
        {
            label: 'Total Machines',
            value: machineCount,
            icon: Package,
        },
        {
            label: 'Total Locations',
            value: locationCount,
            icon: MapPin,
        },
        {
            label: 'Monthly Revenue',
            value: formatCurrency(revenueCount),
            icon: DollarSign,
        },
        {
            label: 'Net Revenue',
            value: formatCurrency(client.totalNetRevenue || 0),
            icon: DollarSign,
        },
        {
            label: 'Days in Program',
            value: client.daysInProgram || 0,
            icon: Calendar,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric) => (
                <GlassCard key={metric.label} className="p-4 bg-white border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <metric.icon className="h-4 w-4 text-emerald-600" />
                        <p className="text-xs text-slate-500">{metric.label}</p>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
                </GlassCard>
            ))}
        </div>
    );
}
