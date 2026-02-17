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
                    className="absolute top-4 left-4 z-30 h-10 w-10 rounded-md border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-black transition-all"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[340px] p-0 flex flex-col z-50 border-r border-gray-200 bg-white text-black">
                <SheetHeader className="p-4 border-b border-gray-100">
                    <SheetTitle className="text-left flex items-center gap-2">
                        <span className="font-bold text-xl tracking-tight text-black">VendingMap</span>
                        <span className="text-xs font-normal text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full border border-gray-200">v2.0</span>
                    </SheetTitle>
                </SheetHeader>

                <div className="p-4 border-b border-gray-100 bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:bg-white focus:ring-black/5 transition-all"
                        />
                    </div>
                    <div className="mt-2 text-xs text-gray-500 text-right">
                        Showing {resultCount} results
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-6">
                        {/* Stats Section */}
                        <div>
                            <h3 className="text-sm font-medium text-black mb-3">Overview</h3>
                            <SidebarStats stats={stats} />
                        </div>

                        <Separator className="bg-gray-100" />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-black">Filters</h3>
                                {(searchQuery || JSON.stringify(filters) !== JSON.stringify({ states: [], membershipLevels: [], minMachines: 0, maxMachines: 20 })) && (
                                    <Button variant="ghost" size="sm" onClick={onResetFilters} className="h-auto p-0 text-xs text-gray-500 hover:text-black hover:bg-transparent underline decoration-gray-300 underline-offset-2">
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

                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-xs text-center text-gray-400">
                        &copy; 2024 VendingPreneur
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
