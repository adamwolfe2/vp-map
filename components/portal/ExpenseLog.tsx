'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logExpense } from '@/lib/actions/finance';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Expense = {
    id: string;
    category: string;
    amount: number;
    description: string | null;
    date: Date;
}

export default function ExpenseLog({ recentExpenses }: { recentExpenses: Expense[] }) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Gas');
    const [desc, setDesc] = useState('');
    const router = useRouter();

    const handleSubmit = async () => {
        try {
            await logExpense({
                amount: parseFloat(amount),
                category,
                description: desc
            });
            toast.success('Expense saved');
            setAmount('');
            setDesc('');
            router.refresh();
        } catch {
            toast.error('Failed to log expense');
        }
    };

    return (
        <Card>
            <CardHeader><CardTitle>Log Expense</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Amount</Label>
                        <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Gas">Gas/Fuel</SelectItem>
                                <SelectItem value="COGS">Inventory (COGS)</SelectItem>
                                <SelectItem value="Repair">Maintenance/Repair</SelectItem>
                                <SelectItem value="Insurance">Insurance</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <Label>Description (Optional)</Label>
                    <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Shell Station" />
                </div>
                <Button onClick={handleSubmit} className="w-full">Add Expense</Button>

                <div className="mt-8">
                    <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Recent History</h4>
                    <div className="space-y-2">
                        {recentExpenses.map((e) => (
                            <div key={e.id} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded border">
                                <div>
                                    <div className="font-medium">{e.category}</div>
                                    <div className="text-xs text-muted-foreground">{e.description || new Date(e.date).toLocaleDateString()}</div>
                                </div>
                                <div className="font-mono text-red-600">-${e.amount.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
