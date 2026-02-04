import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { MOCK_DATA } from '@/lib/mock_data';

export default function AdminRevenueChart() {
    // Aggregate revenue by membership Level
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = MOCK_DATA.reduce((acc, client: any) => {
        const level = client.membershipLevel || 'Unknown';
        const rawRev = client.totalMonthlyRevenue;
        // Parse revenue
        const amount = typeof rawRev === 'string' ? parseFloat(rawRev.replace(/[^0-9.]/g, '')) : (rawRev || 0);

        const existing = acc.find(item => item.name === level);
        if (existing) {
            existing.total += amount;
        } else {
            acc.push({ name: level, total: amount });
        }
        return acc;
    }, [] as { name: string; total: number }[]);

    // Sort by total desc
    data.sort((a, b) => b.total - a.total);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="font-bold">{payload[0].payload.name}</span>
                                        <span className="text-right text-muted-foreground">
                                            ${payload[0].value?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )
                        }
                        return null
                    }}
                />
                <Bar
                    dataKey="total"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
