import dynamicImport from 'next/dynamic';
import ClientPageWrapper from '@/components/ClientPageWrapper';

const AdminDashboard = dynamicImport(() => import('@/components/admin/AdminDashboard'), {
    ssr: false,
    loading: () => <div className="p-4 text-center">Loading Dashboard...</div>
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats: any = null;
    /*
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let innerStats: any = null; // Renamed to avoid redeclaration error
        try {
            innerStats = await getGlobalStats();
        } catch (e) {
            console.error("Failed to fetch admin stats:", e);
        }
        stats = innerStats; // Assign the result of the inner try block
    } catch (e) {
        console.error("Admin stats fetch error:", e);
    }
    */

    // Strict redirect if critical failure, though component handles error state UI too
    if (!stats || 'error' in stats) {
        // Could redirect to login or show error
        // return <div>Unauthorized</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Network Health</h1>
                    <p className="text-muted-foreground">Global VendingOS Operations</p>
                </div>
            </div>


            <ClientPageWrapper>
                <AdminDashboard stats={JSON.parse(JSON.stringify(stats || {
                    totalUsers: 0,
                    totalMachines: 0,
                    totalProducts: 0,
                    totalRevenue: 0,
                    netProfit: 0,
                    recentUsers: [],
                    error: 'Unauthorized'
                }))} />
            </ClientPageWrapper>
        </div>
    );
}
