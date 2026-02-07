

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LeadInbox({ leads }: { leads: any[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map(lead => (
                <Card key={lead.id} className="hover:border-primary transition-colors">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <Badge variant={lead.status === 'NEW' ? 'default' : 'secondary'}>
                                {lead.status}
                            </Badge>
                            {lead.assignedAt && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Calendar size={10} /> {new Date(lead.assignedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg">{lead.businessName}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin size={14} /> {lead.address}
                            </p>
                        </div>

                        {lead.adminNotes && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-xs text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-900 flex gap-2">
                                <MessageSquare size={14} className="shrink-0 mt-0.5" />
                                <span>{lead.adminNotes}</span>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button size="sm" className="w-full" variant="outline">View Details</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {leads.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                    <div className="mb-2">📭</div>
                    No new leads assigned to you yet.
                </div>
            )}
        </div>
    );
}
