import { Card } from '@/components/ui/card';
import { VendingpreneurClient } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Package, MapPin, DollarSign, Calendar } from 'lucide-react';

interface MetricsGridProps {
    client: VendingpreneurClient;
}

export default function MetricsGrid({ client }: MetricsGridProps) {
    const metrics = [
        {
            label: 'Total Machines',
            value: client.totalNumberOfMachines || 0,
            icon: Package,
        },
        {
            label: 'Total Locations',
            value: client.totalNumberOfLocations || 0,
            icon: MapPin,
        },
        {
            label: 'Monthly Revenue',
            value: formatCurrency(client.totalMonthlyRevenue || 0),
            icon: DollarSign,
        },
        {
            label: 'Days in Program',
            value: client.daysInProgram || 0,
            icon: Calendar,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric) => (
                <Card key={metric.label} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <metric.icon className="h-4 w-4 text-primary" />
                        <p className="text-xs text-gray-500">{metric.label}</p>
                    </div>
                    <p className="text-2xl font-semibold">{metric.value}</p>
                </Card>
            ))}
        </div>
    );
}
