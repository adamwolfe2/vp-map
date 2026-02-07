'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Box, DollarSign, Activity } from 'lucide-react';

type AdminStats = {
    totalUsers: number;
    totalMachines: number;
    totalProducts: number;
    totalRevenue: number;
    netProfit: number;
    recentUsers: {
        name: string | null;
        email: string;
        createdAt: Date;
    }[];
    error?: string;
}

export default function AdminDashboard({ stats }: { stats: AdminStats }) {
    if (!stats || stats.error) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
                <p className="text-muted-foreground">You do not have permission to view this dashboard.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Machines</CardTitle>
                        <Box className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMachines}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Global Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-primary' : 'text-red-500'}`}>
                            ${stats.netProfit.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Signups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentUsers.map((u, i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {u.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{u.name || 'Unknown User'}</div>
                                            <div className="text-xs text-muted-foreground">{u.email}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                            {stats.recentUsers.length === 0 && <div className="text-sm text-muted-foreground">No recent signups.</div>}
                        </div>
                    </CardContent>
                </Card>

                <Link href="/admin/leads" className="block">
                    <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Scout Dispatch</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Assign leads to operators.</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/governance" className="block">
                    <Card className="h-full hover:border-red-500 transition-colors cursor-pointer border-red-200 bg-red-50/10">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-red-600">Governance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Global pricing & policy controls.</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
