import dynamicImport from 'next/dynamic';

const PlanogramBuilder = dynamicImport(() => import('@/components/portal/PlanogramBuilder'), {
    ssr: false,
    loading: () => <div className="p-4 text-center">Loading Planogram Builder...</div>
});
import { redirect } from 'next/navigation';
import ClientPageWrapper from '@/components/ClientPageWrapper';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default async function PlanogramPage({ params }: { params: { id: string } }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const machine: any = { id: params.id, name: 'Loading...', planogram: null };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products: any[] = [];

    /*
    try {
        const fetchedMachine = await getMachineWithPlanogram(params.id);
        if (fetchedMachine) {
            machine = fetchedMachine;
        }
        products = await getProducts();
    } catch (e) {
        console.error("Failed to fetch planogram data:", e);
    }
    */

    if (!machine || !machine.id) {
        // handle 404 safely for build
        redirect('/portal/inventory'); // Redirect if machine is still not valid after fetch attempt
    }

    return (
        <div className="container mx-auto p-4 md:p-8 h-screen flex flex-col">
            <ClientPageWrapper>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{machine.name}</h1>
                        <p className="text-muted-foreground text-sm">Planogram Editor</p>
                    </div>
                </div>

                <div className="flex-1 bg-card border rounded-lg overflow-hidden">
                    <PlanogramBuilder
                        machine={JSON.parse(JSON.stringify({
                            id: machine.id,
                            planogram: machine.planogram ? {
                                id: machine.planogram.id,
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                slots: (machine.planogram.slots || []).map((s: any) => ({
                                    id: s.id,
                                    position: s.position,
                                    capacity: s.capacity,
                                    price: Number(s.price || 0),
                                    productId: s.productId,
                                    product: s.product ? {
                                        name: s.product.name,
                                        price: Number(s.product.price || 0)
                                    } : null
                                }))
                            } : null
                        }))}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        products={JSON.parse(JSON.stringify(products.map((p: any) => ({
                            id: p.id,
                            name: p.name,
                            price: Number(p.price || 0)
                        }))))}
                        refresh={async () => {
                            'use server';
                            // Refresh logic (in real app app router uses router.refresh())
                            // Here we just pass a server action that does nothing or revalidates path
                        }}
                    />
                    {/* Same note on refresh: needs client router hook in the component */}
                </div>
            </ClientPageWrapper>
        </div>
    );
}
