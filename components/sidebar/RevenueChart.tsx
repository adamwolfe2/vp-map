'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        <Card className="shadow-none border-none bg-slate-50/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">6-Month Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#888888"
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#888888"
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString()}`, 'Revenue']}
                            />
                            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === data.length - 1 ? '#22c55e' : '#cbd5e1'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
