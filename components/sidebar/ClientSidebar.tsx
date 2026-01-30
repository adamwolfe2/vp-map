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
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';

interface ClientSidebarProps {
    client: VendingpreneurClient;
    isOpen: boolean;
    onClose: () => void;
}

export default function ClientSidebar({ client, isOpen, onClose }: ClientSidebarProps) {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const membershipColor = MEMBERSHIP_COLORS[client.membershipLevel || 'Expired'];

    const SidebarContent = () => (
        <div className="space-y-4">
            <ContactCard client={client} />
            <MetricsGrid client={client} />
            <LocationsList client={client} />

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
    );

    // Mobile Version (Sheet)
    if (!isDesktop) {
        return (
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-xl">
                    <SheetHeader className="text-left mb-4">
                        <SheetTitle>{client.fullName}</SheetTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge style={{ backgroundColor: membershipColor }} className="text-white">
                                {client.membershipLevel || 'N/A'}
                            </Badge>
                            <Badge variant="outline">{client.status}</Badge>
                        </div>
                    </SheetHeader>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop Version (Sidebar)
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%', opacity: 0.5 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0.5 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 h-screen w-[400px] bg-white shadow-2xl z-40 overflow-y-auto"
                >
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

                    <div className="p-4">
                        <SidebarContent />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
