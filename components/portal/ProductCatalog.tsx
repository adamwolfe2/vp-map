'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { createProduct } from '@/lib/actions/inventory';
import { toast } from 'sonner';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductCatalog({ products, refresh }: { products: any[], refresh: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', brand: '', price: '1.50', cost: '0.50' });

    const handleSubmit = async () => {
        try {
            await createProduct({
                name: formData.name,
                brand: formData.brand,
                price: parseFloat(formData.price),
                cost: parseFloat(formData.cost)
            });
            toast.success('Product added');
            setIsOpen(false);
            setFormData({ name: '', brand: '', price: '1.50', cost: '0.50' });
            refresh();
        } catch {
            toast.error('Failed to create product');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Product Catalog</h2>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2"><Plus size={16} /> Add Product</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                            <div>
                                <Label>Product Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Snickers Bar" />
                            </div>
                            <div>
                                <Label>Brand</Label>
                                <Input value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} placeholder="e.g. Mars" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Cost (COGS)</Label>
                                    <Input type="number" step="0.01" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Vend Price</Label>
                                    <Input type="number" step="0.25" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                            </div>
                            <Button onClick={handleSubmit} className="w-full">Create Product</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map(p => (
                    <div key={p.id} className="p-4 border rounded bg-card flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-muted rounded-full mb-2 flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {p.name.substring(0, 2).toUpperCase()}
                        </div>
                        <h3 className="font-medium text-sm">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                ))}
                {products.length === 0 && <div className="col-span-full text-center text-muted-foreground text-sm py-4">No products found.</div>}
            </div>
        </div>
    );
}
