'use client';

import { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { DashboardStats, MapFilters } from '@/lib/types';
import SidebarStats from './SidebarStats';
import FilterPanel from '@/components/search/FilterPanel';

interface AppSidebarProps {
    stats: DashboardStats;
    searchQuery: string;
    onSearchChange: (val: string) => void;
    filters: MapFilters;
    onFilterChange: (filters: MapFilters) => void;
    onResetFilters: () => void;
    resultCount: number;
}

export default function AppSidebar({
    stats,
    searchQuery,
    onSearchChange,
    filters,
    onFilterChange,
    onResetFilters,
    resultCount
}: AppSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-4 left-4 z-30 h-10 w-10 rounded-full border border-white/20 bg-white/60 dark:bg-black/40 backdrop-blur-md shadow-lg hover:bg-white/80 dark:hover:bg-black/60 transition-all text-slate-800 dark:text-white"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[340px] p-0 flex flex-col z-50 border-r border-white/20 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
                <SheetHeader className="p-4 border-b border-white/10 dark:border-white/5">
                    <SheetTitle className="text-left flex items-center gap-2">
                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">VendingMap</span>
                        <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded-full">v2.0</span>
                    </SheetTitle>
                </SheetHeader>

                <div className="p-4 border-b border-white/10 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 bg-white dark:bg-black/50 border-white/20"
                        />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground text-right">
                        Showing {resultCount} results
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-6">
                        {/* Stats Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Overview</h3>
                            <SidebarStats stats={stats} />
                        </div>

                        <Separator className="bg-slate-200 dark:bg-white/10" />

                        {/* Filters Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Filters</h3>
                                {(searchQuery || JSON.stringify(filters) !== JSON.stringify({ states: [], membershipLevels: [], minMachines: 0, maxMachines: 20 })) && (
                                    <Button variant="ghost" size="sm" onClick={onResetFilters} className="h-auto p-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-transparent">
                                        Reset All
                                    </Button>
                                )}
                            </div>

                            <FilterPanel
                                filters={filters}
                                onChange={onFilterChange}
                                onReset={onResetFilters}
                                embedded={true}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 dark:border-white/5 bg-slate-50 dark:bg-black/20">
                    <p className="text-xs text-center text-muted-foreground">
                        &copy; 2024 VendingPreneur
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
