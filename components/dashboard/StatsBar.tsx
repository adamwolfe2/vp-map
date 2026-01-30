import { Card } from '@/components/ui/card';
import { DashboardStats } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Users, Package, DollarSign, MapPin } from 'lucide-react';

interface StatsBarProps {
    stats: DashboardStats;
    isFiltered: boolean;
}

export default function StatsBar({ stats, isFiltered }: StatsBarProps) {
    const metrics = [
        { label: 'Total Clients', value: stats.totalClients, icon: Users },
        { label: 'Total Machines', value: stats.totalMachines, icon: Package },
        { label: 'Monthly Revenue', value: formatCurrency(stats.totalMonthlyRevenue), icon: DollarSign },
        { label: 'States', value: stats.statesRepresented, icon: MapPin },
    ];

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <Card className="flex items-center gap-6 px-6 py-3 shadow-lg pointer-events-auto bg-white/95 backdrop-blur-sm">
                {metrics.map((metric) => (
                    <div key={metric.label} className="flex items-center gap-3">
                        <metric.icon className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{metric.label}</p>
                            <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                        </div>
                    </div>
                ))}
                {isFiltered && (
                    <div className="border-l pl-4 ml-2">
                        <p className="text-xs text-orange-500 font-medium uppercase tracking-wide">Filtered View</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
