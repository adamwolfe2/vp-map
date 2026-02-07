// import { getMachines, getProducts } from '@/lib/actions/inventory';
// import ProductCatalog from '@/components/portal/ProductCatalog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ClientPageWrapper from '@/components/ClientPageWrapper';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateMachineForm from '@/components/portal/CreateMachineForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function InventoryPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const products: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const machines: any[] = [];

    /*
    try {
        machines = await getMachines();
        products = await getProducts();
    } catch (e) {
        console.error("Failed to fetch inventory data:", e);
    }
    */

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Inventory & Assets</h1>
            </div>

            <ClientPageWrapper>
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Inventory & Machines</h1>
                        <p className="text-muted-foreground">Manage your fleet and stock levels.</p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                                <Plus size={16} /> Add Machine
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Machine</DialogTitle>
                            </DialogHeader>
                            <CreateMachineForm />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column: Machines Grid */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {JSON.parse(JSON.stringify(machines)).map((m: any) => (
                                <div key={m.id} className="border rounded-lg p-4 bg-card shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg">{m.name}</h3>
                                            <p className="text-sm text-muted-foreground capitalize">{m.type}</p>
                                        </div>
                                        <Link href={`/portal/machine/${m.id}`}>
                                            <Button variant="outline" size="sm">Manage</Button>
                                        </Link>
                                    </div>
                                    <div className="text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="text-green-600 font-medium">Online</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Planogram</span>
                                            <span>{m.planogram?.slots?.length || 0} Slots</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {machines.length === 0 && (
                                <div className="col-span-1 md:col-span-2 text-center p-12 border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground mb-4">No machines deployed yet.</p>
                                    <Button>Deploy First Machine</Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Product Catalog */}
                    <div className="lg:col-span-1">
                        {/* 
                        <ProductCatalog 
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            products={JSON.parse(JSON.stringify(products.map((p: any) => ({
                                id: p.id,
                                name: p.name,
                                brand: p.brand,
                                upc: p.upc,
                                cost: Number(p.cost),
                                price: Number(p.price)
                            }))))} 
                            refresh={async () => {
                                'use server';
                            }}
                        />
                        */}
                        <div className="p-4 border rounded text-center text-muted-foreground">Catalog Unavailable</div>
                        {/* Note: Refresh prop needs client-side wrapper or router.refresh() pattern. 
                        For MVP, we'll rely on page reload or simple client state updates in real implementation.
                        To keep it simple, we'll make CreateMachineForm a client component.
                    */}
                    </div>
                </div>
            </ClientPageWrapper>
        </div>
    );
}
