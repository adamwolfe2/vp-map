import { Card } from '@/components/ui/card';
import { DashboardStats } from '@/lib/types';
import { Users, Package, DollarSign, MapPin } from 'lucide-react';
import AnimatedCounter from '@/components/ui/animated-counter';

interface StatsBarProps {
    stats: DashboardStats;
    isFiltered: boolean;
}

export default function StatsBar({ stats, isFiltered }: StatsBarProps) {
    return (
        <div className="absolute top-24 md:top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-full md:w-auto flex justify-center">
            <Card className="flex items-center gap-6 px-6 py-3 shadow-lg pointer-events-auto bg-white/95 backdrop-blur-sm mx-4 md:mx-0 overflow-x-auto max-w-[calc(100vw-2rem)] md:max-w-none no-scrollbar">

                {/* Total Clients */}
                <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Clients</p>
                        <p className="text-lg font-bold text-gray-900">
                            <AnimatedCounter value={stats.totalClients} />
                        </p>
                    </div>
                </div>

                {/* Total Machines */}
                <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Machines</p>
                        <p className="text-lg font-bold text-gray-900">
                            <AnimatedCounter value={stats.totalMachines} />
                        </p>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Monthly Revenue</p>
                        <p className="text-lg font-bold text-gray-900">
                            <AnimatedCounter value={stats.totalMonthlyRevenue} prefix="$" />
                        </p>
                    </div>
                </div>

                {/* States Represented */}
                <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">States</p>
                        <p className="text-lg font-bold text-gray-900">
                            <AnimatedCounter value={stats.statesRepresented} />
                        </p>
                    </div>
                </div>

                {isFiltered && (
                    <div className="border-l pl-4 ml-2">
                        <p className="text-xs text-orange-500 font-medium uppercase tracking-wide">Filtered View</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
