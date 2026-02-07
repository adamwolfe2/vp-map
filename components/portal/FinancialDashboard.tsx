'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FinancialDashboard({ data }: { data: any }) {
    if (!data) return <div>Loading...</div>;

    const { chartData, totalRevenue, totalExpense } = data;
    const netProfit = totalRevenue - totalExpense;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Expenses</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">${totalExpense.toFixed(2)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Net Profit</CardTitle></CardHeader>
                    <CardContent><div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-orange-500'}`}>${netProfit.toFixed(2)}</div></CardContent>
                </Card>
            </div>

            <Card className="h-[400px]">
                <CardHeader><CardTitle>Performance (Last 6 Months)</CardTitle></CardHeader>
                <CardContent className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
