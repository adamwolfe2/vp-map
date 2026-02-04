'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { GlassCard } from '@/components/ui/glass-card';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueChartProps {
    currentMonthlyRevenue: number;
}

export default function RevenueChart({ currentMonthlyRevenue }: RevenueChartProps) {
    const data = useMemo(() => {
        // Generate mock historical data based on current MRR
        const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
        const baseRevenue = currentMonthlyRevenue;

        return months.map((month, index) => {
            // Trend: slightly upward with some random oscillation
            const trendFactor = 0.8 + (index * 0.05); // 0.8 to 1.05
            const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1

            // For the current month (Jan), make it match exactly
            if (index === months.length - 1) {
                return { name: month, revenue: baseRevenue };
            }

            return {
                name: month,
                revenue: Math.round(baseRevenue * trendFactor * randomFactor)
            };
        });
    }, [currentMonthlyRevenue]);

    return (
        <GlassCard className="shadow-xl bg-slate-900/50 border-white/5">
            <CardHeader className="pb-2 text-white/90">
                <CardTitle className="text-sm font-medium text-slate-400">6-Month Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <XAxis
                                dataKey="name"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#94a3b8"
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#94a3b8"
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ fill: '#ffffff05' }}
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderRadius: '8px',
                                    border: '1px solid #1e293b',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)',
                                    color: 'white'
                                }}
                                itemStyle={{ color: '#e2e8f0' }}
                                labelStyle={{ color: '#94a3b8' }}
                                formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString()}`, 'Revenue']}
                            />
                            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === data.length - 1 ? '#22c55e' : '#475569'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </GlassCard>
    );
}
