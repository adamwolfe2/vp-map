'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { assignLead } from '@/lib/actions/leads';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { MapPin, User, Send } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LeadDispatcher({ leads, operators }: { leads: any[], operators: any[] }) {
    const [selectedOperator, setSelectedOperator] = useState<string>('');
    const [notes, setNotes] = useState('');
    const router = useRouter();

    const handleAssign = async (leadId: string) => {
        if (!selectedOperator) {
            toast.error('Select an operator first');
            return;
        }

        try {
            await assignLead(leadId, selectedOperator, notes);
            toast.success('Lead assigned successfully');
            setNotes('');
            router.refresh();
        } catch {
            toast.error('Failed to assign lead');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Unassigned Leads (Scout Pool)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {leads.map(lead => (
                        <div key={lead.id} className="border p-4 rounded-lg space-y-3 bg-muted/20">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold">{lead.businessName}</h4>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MapPin size={14} /> {lead.address}
                                    </p>
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {lead.source}
                                </span>
                            </div>

                            <div className="pt-3 border-t flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="text-xs text-muted-foreground mb-1 block">Assign To:</label>
                                    <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Select Operator" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {operators.map(op => (
                                                <SelectItem key={op.id} value={op.id}>{op.name} ({op.email})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button size="sm" onClick={() => handleAssign(lead.id)} disabled={!selectedOperator}>
                                    <Send size={14} className="mr-1" /> Assign
                                </Button>
                            </div>
                            <Input
                                placeholder="Admin Notes (e.g. 'Talk to Susan manager')"
                                className="h-8 text-xs"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>
                    ))}
                    {leads.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            No unassigned leads found. Go scout some!
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Operator Roster</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {operators.map(op => (
                            <div key={op.id} className="flex items-center gap-3 p-2 border rounded hover:bg-muted/50">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User size={16} />
                                </div>
                                <div>
                                    <div className="font-medium text-sm">{op.name}</div>
                                    <div className="text-xs text-muted-foreground">{op.email}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
