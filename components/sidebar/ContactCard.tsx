'use client';

import { Mail, Phone, MapPin, Building, Copy } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { VendingpreneurClient } from '@/lib/types';
import { formatPhoneNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface ContactCardProps {
    client: VendingpreneurClient;
}

export default function ContactCard({ client }: ContactCardProps) {
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const openGoogleMaps = (address: string) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    };

    return (
        <GlassCard className="p-4 space-y-3 bg-slate-800/50 border-white/5">
            {client.personalEmail && (
                <div className="flex items-center justify-between group">
                    <a
                        href={`mailto:${client.personalEmail}`}
                        className="flex items-center gap-2 text-sm hover:text-blue-400 truncate text-slate-300"
                    >
                        <Mail className="h-4 w-4 text-slate-500" />
                        <span className="truncate">{client.personalEmail}</span>
                    </a>
                    <button
                        onClick={() => copyToClipboard(client.personalEmail!, 'Email')}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded"
                    >
                        <Copy className="h-3 w-3 text-slate-400" />
                    </button>
                </div>
            )}

            {client.phoneNumber && (
                <div className="flex items-center justify-between group">
                    <a
                        href={`tel:${client.phoneNumber}`}
                        className="flex items-center gap-2 text-sm hover:text-blue-400 text-slate-300"
                    >
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span>{formatPhoneNumber(client.phoneNumber)}</span>
                    </a>
                    <button
                        onClick={() => copyToClipboard(client.phoneNumber!, 'Phone')}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded"
                    >
                        <Copy className="h-3 w-3 text-slate-400" />
                    </button>
                </div>
            )}

            {client.businessName && (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Building className="h-4 w-4 text-slate-500" />
                    <span>{client.businessName}</span>
                </div>
            )}

            {client.fullAddress && (
                <div
                    className="flex items-start gap-2 text-sm cursor-pointer hover:bg-white/5 p-1 -ml-1 rounded transition-colors group"
                    onClick={() => openGoogleMaps(client.fullAddress!)}
                >
                    <MapPin className="h-4 w-4 text-slate-500 mt-0.5 group-hover:text-blue-400" />
                    <span className="text-slate-300 group-hover:text-white">{client.fullAddress}</span>
                </div>
            )}
        </GlassCard>
    );
}
