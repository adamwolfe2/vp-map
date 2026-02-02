'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_DATA } from '@/lib/mock_data';
import { Users, DollarSign, MapPin, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
    const totalClients = MOCK_DATA.length;
    // Calculate total MRR from mock data (approximate)
    const totalRevenue = MOCK_DATA.reduce((acc, curr) => {
        const val = curr.totalMonthlyRevenue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rev = typeof val === 'string' ? parseInt((val as any).replace(/[^0-9]/g, '')) : (val || 0);
        return acc + rev;
    }, 0);

    // Count total locations (Main + 1-5 sub locations)
    const totalLocations = MOCK_DATA.reduce((acc, curr) => {
        let count = 1; // Main
        for (let i = 1; i <= 5; i++) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((curr as any)[`location${i}Address`]) count++;
        }
        return acc + count;
    }, 0);

    const stats = [
        {
            title: "Total Clients",
            value: totalClients.toLocaleString(),
            icon: Users,
            color: "text-blue-600"
        },
        {
            title: "Monthly Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-emerald-600"
        },
        {
            title: "Active Locations",
            value: totalLocations.toLocaleString(),
            icon: MapPin,
            color: "text-purple-600"
        },
        {
            title: "Platform Activity",
            value: "+12%",
            description: "vs last month",
            icon: Activity,
            color: "text-orange-600"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Platform overview and high-level metrics.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            {stat.description && (
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Placeholder for future charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-slate-400">
                            Chart Coming Soon
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Signups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {MOCK_DATA.slice(0, 5).map(client => (
                                <div key={client.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{client.fullName}</p>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <p className="text-sm text-muted-foreground">{(client as any).personalEmail}</p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {client.membershipLevel || 'Standard'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
