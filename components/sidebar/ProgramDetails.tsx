'use client';

import { Card } from '@/components/ui/card';
import { VendingpreneurClient } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Calendar, Briefcase, UserCheck, FileText } from 'lucide-react';

interface ProgramDetailsProps {
    client: VendingpreneurClient;
}

export default function ProgramDetails({ client }: ProgramDetailsProps) {
    const hasData = client.programStartDate || client.salesRep || client.nationalContracts?.length;

    if (!hasData) return null;

    return (
        <Card className="p-4 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 border-b pb-2">Program Details</h4>

            <div className="space-y-3">
                {client.programStartDate && (
                    <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Start Date</p>
                            <p className="text-sm text-slate-700">{formatDate(client.programStartDate)}</p>
                        </div>
                    </div>
                )}

                {client.skoolJoinDate && (
                    <div className="flex items-start gap-3">
                        <UserCheck className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Skool Join Date</p>
                            <p className="text-sm text-slate-700">{formatDate(client.skoolJoinDate)}</p>
                        </div>
                    </div>
                )}

                {client.salesRep && (
                    <div className="flex items-start gap-3">
                        <Briefcase className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Sales Representative</p>
                            <p className="text-sm text-slate-700">{client.salesRep}</p>
                        </div>
                    </div>
                )}

                {client.nationalContracts && client.nationalContracts.length > 0 && (
                    <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 font-medium mb-1">National Contracts</p>
                            <div className="flex flex-wrap gap-1">
                                {Array.isArray(client.nationalContracts) ? client.nationalContracts.map((contract, i) => (
                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                        {contract}
                                    </span>
                                )) : (
                                    <span className="text-sm text-slate-700">{client.nationalContracts}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
