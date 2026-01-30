'use client';

import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VendingpreneurClient } from '@/lib/types';
import { MEMBERSHIP_COLORS } from '@/lib/constants';
import { getAirtableRecordUrl } from '@/lib/airtable';
import ContactCard from './ContactCard';
import MetricsGrid from './MetricsGrid';
import LocationsList from './LocationsList';

interface ClientSidebarProps {
    client: VendingpreneurClient;
    isOpen: boolean;
    onClose: () => void;
}

export default function ClientSidebar({ client, isOpen, onClose }: ClientSidebarProps) {
    if (!isOpen) return null;

    const membershipColor = MEMBERSHIP_COLORS[client.membershipLevel || 'Expired'];

    return (
        <div className="fixed right-0 top-0 h-screen w-[400px] bg-white shadow-2xl z-40 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-start justify-between z-10">
                <div className="flex-1">
                    <h2 className="text-xl font-semibold">{client.fullName}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge
                            style={{ backgroundColor: membershipColor }}
                            className="text-white hover:opacity-90"
                        >
                            {client.membershipLevel || 'N/A'}
                        </Badge>
                        <Badge variant="outline">{client.status}</Badge>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                <ContactCard client={client} />
                <MetricsGrid client={client} />
                <LocationsList client={client} />

                {/* View in Airtable */}
                <a
                    href={getAirtableRecordUrl(client.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Full Profile in Airtable
                    </Button>
                </a>
            </div>
        </div>
    );
}
