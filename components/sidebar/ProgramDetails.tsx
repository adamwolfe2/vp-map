'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { VendingpreneurClient } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Calendar, Briefcase, UserCheck, FileText, Zap, Clock } from 'lucide-react';

interface ProgramDetailsProps {
    client: VendingpreneurClient;
}

export default function ProgramDetails({ client }: ProgramDetailsProps) {
    const hasData = client.programStartDate || client.salesRep || client.nationalContracts?.length;

    if (!hasData) return null;

    return (
    return (
        <GlassCard className="p-4 space-y-4 bg-white border-slate-200 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">Program Details</h4>

            <div className="space-y-3">
                {client.programLevel && (
                    <div className="flex items-start gap-3">
                        <Zap className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Program Level</p>
                            <p className="text-sm text-slate-900 font-medium">{client.programLevel}</p>
                        </div>
                    </div>
                )}

                {client.daysInProgram !== undefined && (
                    <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Time in Program</p>
                            <p className="text-sm text-slate-900">{client.daysInProgram} days</p>
                        </div>
                    </div>
                )}
                {client.programStartDate && (
                    <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Start Date</p>
                            <p className="text-sm text-slate-900">{formatDate(client.programStartDate)}</p>
                        </div>
                    </div>
                )}

                {client.skoolJoinDate && (
                    <div className="flex items-start gap-3">
                        <UserCheck className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Skool Join Date</p>
                            <p className="text-sm text-slate-900">{formatDate(client.skoolJoinDate)}</p>
                        </div>
                    </div>
                )}

                {client.salesRep && (
                    <div className="flex items-start gap-3">
                        <Briefcase className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Sales Representative</p>
                            <p className="text-sm text-slate-900">{client.salesRep}</p>
                        </div>
                    </div>
                )}

                {client.nationalContracts && client.nationalContracts.length > 0 && (
                    <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 font-medium mb-1">National Contracts</p>
                            <div className="flex flex-wrap gap-1">
                                {Array.isArray(client.nationalContracts) ? client.nationalContracts.map((contract, i) => (
                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                        {contract}
                                    </span>
                                )) : (
                                    <span className="text-sm text-slate-900">{client.nationalContracts}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
