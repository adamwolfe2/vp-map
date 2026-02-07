
// import { currentUser } from '@clerk/nextjs/server';
// import { getAdminLeads, getOperators, assignLead } from '@/lib/actions/leads';
import dynamicImport from 'next/dynamic';
import ClientPageWrapper from '@/components/ClientPageWrapper';

const LeadDispatcher = dynamicImport(() => import('@/components/admin/LeadDispatcher'), {
    ssr: false,
    loading: () => <div className="p-4 text-center">Loading Dispatcher...</div>
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLeadsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leads: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const operators: any[] = [];
    /*
    try {
        leads = await getAdminLeads();
        operators = await getOperators();
    } catch (e) {
        console.error("Failed to fetch admin leads data:", e);
    }
    */

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Scout Dispatch</h1>
                <p className="text-muted-foreground">Assign discovered locations to operators.</p>
            </div>

            <ClientPageWrapper>
                <LeadDispatcher
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    leads={JSON.parse(JSON.stringify(leads.map((l: any) => ({
                        id: l.id,
                        status: l.status,
                        businessName: l.businessName,
                        address: l.address,
                        operatorNotes: l.operatorNotes,
                        operatorId: l.operatorId,
                        createdAt: l.createdAt.toISOString()
                    }))))}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    operators={JSON.parse(JSON.stringify(operators.map((o: any) => ({
                        id: o.id,
                        name: o.name,
                        email: o.email
                    }))))}
                />
            </ClientPageWrapper>
        </div>
    );
}
