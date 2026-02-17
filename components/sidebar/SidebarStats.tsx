import { Card } from '@/components/ui/card';
import { DashboardStats } from '@/lib/types';
import { Users, Package, DollarSign } from 'lucide-react';
import AnimatedCounter from '@/components/ui/animated-counter';

interface SidebarStatsProps {
    stats: DashboardStats;
}

export default function SidebarStats({ stats }: SidebarStatsProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Clients</p>
                </div>
                <p className="text-xl font-bold text-black">
                    <AnimatedCounter value={stats.totalClients} />
                </p>
            </Card>

            <Card className="p-3 bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-gray-500" />
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Machines</p>
                </div>
                <p className="text-xl font-bold text-black">
                    <AnimatedCounter value={stats.totalMachines} />
                </p>
            </Card>

            <Card className="p-3 bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow col-span-2">
                <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Revenue</p>
                </div>
                <p className="text-2xl font-bold text-black">
                    <AnimatedCounter value={stats.totalMonthlyRevenue} prefix="$" />
                </p>
            </Card>
        </div>
    );
}
