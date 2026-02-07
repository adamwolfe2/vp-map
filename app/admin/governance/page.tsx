
import GovernanceControls from '@/components/admin/GovernanceControls';

export const dynamic = 'force-dynamic';

export default function GovernancePage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Governance</h1>
                <p className="text-muted-foreground">Franchise-wide controls and policy enforcement.</p>
            </div>

            <div className="max-w-2xl">
                <GovernanceControls />
            </div>
        </div>
    );
}
