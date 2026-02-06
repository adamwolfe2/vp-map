'use client';

import { useState } from 'react';
import { X, ExternalLink, MapPin, BarChart3, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientSidebarProps } from '@/lib/types';
import { MEMBERSHIP_COLORS } from '@/lib/constants';
import { getAirtableRecordUrl } from '@/lib/airtable';
import ContactCard from './ContactCard';
import ProgramDetails from './ProgramDetails';
import MetricsGrid from './MetricsGrid';
import RevenueChart from './RevenueChart';
import LocationGallery from './LocationGallery';
import LeadGenerator from '@/components/leads/LeadGenerator';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';



type Tab = 'overview' | 'locations' | 'analytics' | 'leads';

export default function ClientSidebar({ client, isOpen, onClose, onLeadsFound }: ClientSidebarProps) {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const membershipColor = MEMBERSHIP_COLORS[client.membershipLevel || 'Expired'];
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-900/40">
            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 px-6 pt-2 pb-0 bg-transparent border-b border-white/10 sticky top-0 z-10">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('overview')}
                    className={cn(
                        "rounded-b-none border-b-2 border-transparent px-4 py-2 h-auto text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5",
                        activeTab === 'overview' && "border-blue-500 text-blue-400 bg-blue-500/10"
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
                        "rounded-b-none border-b-2 border-transparent px-4 py-2 h-auto text-sm font-medium text-slate-500 hover:text-slate-900",
                        activeTab === 'locations' && "border-blue-600 text-blue-600 bg-blue-50/50"
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
                        "rounded-b-none border-b-2 border-transparent px-4 py-2 h-auto text-sm font-medium text-slate-500 hover:text-slate-900",
                        activeTab === 'analytics' && "border-blue-600 text-blue-600 bg-blue-50/50"
                    )}
                >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('leads')}
                    className={cn(
                        "rounded-b-none border-b-2 border-transparent px-4 py-2 h-auto text-sm font-medium text-slate-500 hover:text-slate-900",
                        activeTab === 'leads' && "border-blue-600 text-blue-600 bg-blue-50/50"
                    )}
                >
                    <MapPin className="h-4 w-4 mr-2" />
                    Lead Gen
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
                            <ProgramDetails client={client} />

                            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                                <h4 className="text-sm font-semibold text-blue-300 mb-2">Internal Notes</h4>
                                <p className="text-sm text-blue-200/80 leading-relaxed">
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
                                <h3 className="text-4xl font-bold text-white mt-2">
                                    ${(client.totalMonthlyRevenue || 0).toLocaleString()}
                                </h3>
                            </div>

                            <RevenueChart currentMonthlyRevenue={client.totalMonthlyRevenue || 0} />

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5 shadow-sm">
                                    <p className="text-xs text-slate-400">Machines Placed</p>
                                    <p className="text-2xl font-semibold text-white mt-1">{client.machinesPlaced || 0}</p>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5 shadow-sm">
                                    <p className="text-xs text-slate-400">Locations</p>
                                    <p className="text-2xl font-semibold text-white mt-1">{client.totalNumberOfLocations || 0}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'leads' && (
                        <motion.div
                            key="leads"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <LeadGenerator
                                client={client}
                                onLeadsFound={onLeadsFound || (() => { })}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-slate-900 space-y-2">
                {isAuthenticated && user?.id === client.id ? (
                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => router.push('/portal')}
                    >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Manage My Profile
                    </Button>
                ) : !isAuthenticated ? (
                    <Button
                        variant="default"
                        className="w-full"
                        onClick={() => router.push('/login')}
                    >
                        Claim This Profile
                    </Button>
                ) : null}

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
        <div className="flex-1 pr-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">{client.fullName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge
                    style={{ backgroundColor: membershipColor }}
                    className="text-white hover:opacity-90 px-2.5 py-0.5 text-xs font-semibold shadow-sm rounded-md"
                >
                    {client.membershipLevel || 'N/A'}
                </Badge>
                <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium bg-white/10 text-slate-300 border-white/10">
                    {client.status}
                </Badge>
                {client.vendHubClientId && (
                    <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/20">
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
                    <SheetHeader className="text-left p-6 border-b border-white/10 bg-slate-900 text-white">
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
                    className="fixed right-0 top-0 h-screen w-[600px] bg-slate-950/90 backdrop-blur-xl border-l border-white/10 shadow-2xl z-40 flex flex-col"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-slate-950/50 backdrop-blur-md border-b border-white/10 p-6 flex items-start justify-between z-20 shadow-sm">
                        <HeaderContent />
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Main Content */}
                    <SidebarContent />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
