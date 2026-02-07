
import dynamicImport from 'next/dynamic';

const LeadInbox = dynamicImport(() => import('@/components/portal/LeadInbox'), {
    ssr: false,
    loading: () => <div className="p-4 text-center">Loading Inbox...</div>
});
import ClientPageWrapper from '@/components/ClientPageWrapper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OperatorLeadsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leads: any[] = [];
    /*
    try {
        try {
            leads = await getMyLeads();
        } catch (e) {
            console.error("Failed to fetch leads:", e);
        }
    } catch (e) {
        console.error("Build time error or auth error:", e);
    }
    */

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Lead Inbox</h1>
                <p className="text-muted-foreground">New locations assigned to you.</p>
            </div>

            <ClientPageWrapper>
                <LeadInbox
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    leads={JSON.parse(JSON.stringify(leads.map((l: any) => ({
                        id: l.id,
                        businessName: l.businessName,
                        address: l.address,
                        status: l.status,
                        assignedAt: l.assignedAt ? l.assignedAt.toISOString() : null,
                        adminNotes: l.adminNotes
                    }))))} />
            </ClientPageWrapper>
        </div>
    );
}
