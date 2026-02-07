'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createMachine } from '@/lib/actions/inventory';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CreateMachineForm() {
    const [name, setName] = useState('');
    const [type, setType] = useState('Combo');
    const router = useRouter();

    const handleSubmit = async () => {
        try {
            await createMachine(name, type);
            toast.success('Machine created');
            router.refresh();
            // In a real app we'd close the dialog here via context or prop
        } catch {
            toast.error('Failed to create machine');
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Machine Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Hotel 2nd Floor" />
            </div>
            <div>
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Combo">Combo (Snack + Drink)</SelectItem>
                        <SelectItem value="Snack">Snack Only</SelectItem>
                        <SelectItem value="Drink">Drink Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleSubmit} className="w-full">Create</Button>
        </div>
    );
}
