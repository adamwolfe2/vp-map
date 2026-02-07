'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { pushGlobalPriceUpdate } from '@/lib/actions/governance';
import { toast } from 'sonner';
import { DollarSign, RefreshCw, AlertTriangle } from 'lucide-react';

export default function GovernanceControls() {
    const [upc, setUpc] = useState('');
    const [price, setPrice] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async () => {
        if (!upc || !price) {
            toast.error('Missing fields');
            return;
        }

        setIsLoading(true);
        try {
            const res = await pushGlobalPriceUpdate(upc, parseFloat(price));
            toast.success(`Success! Updated ${res.productsUpdated} products and ${res.slotsUpdated} machine slots across the network.`);
            setUpc('');
            setPrice('');
        } catch {
            toast.error('Update failed. Ensure you are Admin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-red-200 dark:border-red-900 shadow-lg">
            <CardHeader className="bg-red-50 dark:bg-red-900/10 rounded-t-lg">
                <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle size={20} /> Franchise Governance
                </CardTitle>
                <CardDescription>
                    Push global updates to all operators. <span className="font-bold">Use with caution.</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <DollarSign size={16} /> Global Price Override
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Product UPC</Label>
                            <Input
                                placeholder="e.g. 012000000133"
                                value={upc}
                                onChange={e => setUpc(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>New Franchise Price</Label>
                            <Input
                                type="number"
                                step="0.25"
                                placeholder="2.50"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleUpdate}
                        disabled={isLoading}
                        variant="destructive"
                        className="w-full"
                    >
                        {isLoading ? <RefreshCw className="animate-spin mr-2" /> : null}
                        Push Price Update to Network
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        This will override local pricing for all operators carrying this product.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
