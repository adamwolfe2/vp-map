'use client';

import { useState } from 'react';
import { updateSlot } from '@/lib/actions/inventory';
import { toast } from 'sonner';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PlanogramBuilder({ machine, products, refresh }: { machine: any, products: any[], refresh: () => void }) {
    // Generate grid: A-E rows, 1-9 cols
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Quick-select product
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

    const handleSlotClick = async (position: string) => {
        if (!selectedProduct) return;

        try {
            // Find product defaults
            const product = products.find(p => p.id === selectedProduct);
            if (!product) return;

            await updateSlot(machine.planogram.id, position, selectedProduct, 10, product.price || 1.50);
            toast.success(`Updated slot ${position}`);
            refresh();
        } catch {
            toast.error('Failed to update slot');
        }
    };

    const getSlot = (position: string) => {
        return machine.planogram?.slots?.find((s: { position: string; }) => s.position === position);
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[600px]">
            {/* Toolbar */}
            <div className="w-full md:w-64 border-r pr-4 space-y-4">
                <h3 className="font-semibold">Drag Product</h3>
                <p className="text-xs text-muted-foreground">Click a product then click a slot to assign.</p>
                <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
                    {products.map(p => (
                        <div
                            key={p.id}
                            onClick={() => setSelectedProduct(p.id)}
                            className={`p-2 border rounded cursor-pointer text-xs ${selectedProduct === p.id ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}
                        >
                            <div className="font-medium truncate">{p.name}</div>
                            <div className="text-muted-foreground">${p.price}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visual Grid */}
            <div className="flex-1 overflow-auto bg-muted/20 p-8 rounded border flex items-center justify-center">
                <div className="grid gap-4">
                    {rows.map(row => (
                        <div key={row} className="flex gap-4">
                            {cols.map(col => {
                                const pos = `${row}${col}`;
                                const slot = getSlot(pos);
                                return (
                                    <div
                                        key={pos}
                                        onClick={() => handleSlotClick(pos)}
                                        className={`
                                            w-16 h-24 border-2 rounded flex flex-col items-center justify-center p-1 cursor-pointer transition-colors
                                            ${slot ? 'bg-card border-primary/50' : 'bg-background border-dashed hover:border-primary'}
                                        `}
                                    >
                                        <span className="text-[10px] font-bold text-muted-foreground mb-1">{pos}</span>
                                        {slot && slot.product ? (
                                            <>
                                                <div className="text-[10px] font-medium text-center leading-tight line-clamp-2">{slot.product.name}</div>
                                                <div className="mt-1 text-[10px] bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1 rounded">
                                                    ${slot.price.toFixed(2)}
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground/50">Empty</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
