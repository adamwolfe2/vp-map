'use client';

import { useState } from 'react';
import { X, ExternalLink, MapPin, BarChart3, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VendingpreneurClient } from '@/lib/types';
import { MEMBERSHIP_COLORS } from '@/lib/constants';
import { getAirtableRecordUrl } from '@/lib/airtable';
import ContactCard from './ContactCard';
import MetricsGrid from './MetricsGrid';
import RevenueChart from './RevenueChart';
import LocationGallery from './LocationGallery';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface ClientSidebarProps {
    client: VendingpreneurClient;
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'overview' | 'locations' | 'analytics';

export default function ClientSidebar({ client, isOpen, onClose }: ClientSidebarProps) {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const membershipColor = MEMBERSHIP_COLORS[client.membershipLevel || 'Expired'];
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-50/30">
            {/* Tabs Navigation */}
            <div className="flex items-center space-x-1 p-2 bg-white border-b sticky top-0 z-10">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('overview')}
                    className={cn(
                        "flex-1 justify-center rounded-none border-b-2 border-transparent hover:bg-transparent px-2 transition-colors",
                        activeTab === 'overview' && "border-primary text-primary font-medium"
                    )}
                >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Overview
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('locations')}
                    className={cn(
                        "flex-1 justify-center rounded-none border-b-2 border-transparent hover:bg-transparent px-2 transition-colors",
                        activeTab === 'locations' && "border-primary text-primary font-medium"
                    )}
                >
                    <MapPin className="h-4 w-4 mr-2" />
                    Locations
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('analytics')}
                    className={cn(
                        "flex-1 justify-center rounded-none border-b-2 border-transparent hover:bg-transparent px-2 transition-colors",
                        activeTab === 'analytics' && "border-primary text-primary font-medium"
                    )}
                >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                </Button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <MetricsGrid client={client} />
                            <Separator />
                            <ContactCard client={client} />

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h4 className="text-sm font-semibold text-blue-900 mb-2">Internal Notes</h4>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    {client.notes || "No internal notes available for this client."}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'locations' && (
                        <motion.div
                            key="locations"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <LocationGallery client={client} />
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-6">
                                <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Total Monthly Revenue</p>
                                <h3 className="text-4xl font-bold text-slate-900 mt-2">
                                    ${(client.totalMonthlyRevenue || 0).toLocaleString()}
                                </h3>
                            </div>

                            <RevenueChart currentMonthlyRevenue={client.totalMonthlyRevenue || 0} />

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="bg-white p-4 rounded-lg border shadow-sm">
                                    <p className="text-xs text-muted-foreground">Machines Placed</p>
                                    <p className="text-2xl font-semibold mt-1">{client.machinesPlaced || 0}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border shadow-sm">
                                    <p className="text-xs text-muted-foreground">Locations</p>
                                    <p className="text-2xl font-semibold mt-1">{client.totalNumberOfLocations || 0}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t bg-white">
                <a
                    href={getAirtableRecordUrl(client.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Source Record
                    </Button>
                </a>
            </div>
        </div>
    );

    // Header Content (shared)
    const HeaderContent = () => (
        <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">{client.fullName}</h2>
            <div className="flex items-center gap-2 mt-2">
                <Badge
                    style={{ backgroundColor: membershipColor }}
                    className="text-white hover:opacity-90 px-3 py-1 text-sm font-medium shadow-sm"
                >
                    {client.membershipLevel || 'N/A'}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 text-sm">{client.status}</Badge>
                {client.vendHubClientId && (
                    <Badge variant="secondary" className="px-3 py-1 text-sm bg-indigo-100 text-indigo-800">
                        VendHub Sync
                    </Badge>
                )}
            </div>
        </div>
    );

    // Mobile Version (Sheet)
    if (!isDesktop) {
        return (
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent side="bottom" className="h-[90vh] overflow-hidden flex flex-col p-0 rounded-t-xl">
                    <SheetHeader className="text-left p-6 border-b bg-white">
                        <SheetTitle className="sr-only">Client Details</SheetTitle> {/* Accessibility */}
                        <HeaderContent />
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
                    // WIDER SIDEBAR: w-[600px]
                    className="fixed right-0 top-0 h-screen w-[600px] bg-white shadow-2xl z-40 flex flex-col border-l"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b p-6 flex items-start justify-between z-20 shadow-sm">
                        <HeaderContent />
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
                            <X className="h-6 w-6 text-slate-500" />
                        </Button>
                    </div>

                    {/* Main Content */}
                    <SidebarContent />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
