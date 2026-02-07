import dynamicImport from 'next/dynamic';
import ClientPageWrapper from '@/components/ClientPageWrapper';

const FinancialDashboard = dynamicImport(() => import('@/components/portal/FinancialDashboard'), {
    ssr: false,
    loading: () => <div className="h-[200px] flex items-center justify-center border rounded-lg bg-muted/10">Loading Finance...</div>
});

const ExpenseLog = dynamicImport(() => import('@/components/portal/ExpenseLog'), {
    ssr: false,
    loading: () => <div className="p-4 text-center">Loading Expenses...</div>
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FinancePage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
        chartData: [],
        totalRevenue: 0,
        totalExpense: 0,
        recentExpenses: []
    };
    /*
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let summary: any = null;
    */

    /*
    try {
        data = await getFinancialSummary() || data;
    } catch (error) {
        console.error("Finance fetch error:", error);
    }
    */

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <h1 className="text-2xl font-bold">Financial Command Center</h1>

            <ClientPageWrapper>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <FinancialDashboard data={JSON.parse(JSON.stringify(data ? {
                            totalRevenue: Number(data.totalRevenue || 0),
                            totalExpense: Number(data.totalExpense || 0),
                            netProfit: Number(data.netProfit || 0),
                            chartData: data.chartData
                        } : null))} />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <ExpenseLog recentExpenses={(data.recentExpenses || []).map((e: any) => ({
                                id: e.id,
                                category: e.category,
                                amount: Number(e.amount),
                                description: e.description,
                                date: e.date // Client component needs date object or string? Let's check ExpenseLog
                            }))} />
                            {/* Placeholder for future module */}
                        </div>
                    </div>
                </div>
            </ClientPageWrapper>
        </div>
    );
}
