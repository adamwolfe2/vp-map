'use client';

import { MOCK_DATA } from '@/lib/mock_data';
import { columns } from '@/components/admin/clients/columns';
import { DataTable } from '@/components/admin/clients/data-table';

export default function ClientsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                <p className="text-muted-foreground">
                    Manage your client base, view revenue, and update statuses.
                </p>
            </div>

            <DataTable columns={columns} data={MOCK_DATA as unknown as import('@/lib/types').VendingpreneurClient[]} />
        </div>
    );
}
