'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { MapFilters, MEMBERSHIP_LEVELS } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterPanelProps {
    filters: MapFilters;
    onChange: (filters: MapFilters) => void;
    onReset: () => void;
}

export default function FilterPanel({ filters, onChange, onReset, embedded = false }: FilterPanelProps & { embedded?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    const hasActiveFilters =
        filters.states.length > 0 ||
        filters.membershipLevels.length > 0 ||
        filters.minMachines > 0 ||
        filters.maxMachines < 20 ||
        (filters.minRevenue || 0) > 0 ||
        (filters.maxRevenue || 10000) < 10000 ||
        (filters.machineTypes?.length || 0) > 0;

    const FilterContent = (
        <div className={embedded ? "space-y-6" : "space-y-6"}>
            {!embedded && <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>}

            {/* Membership Level */}
            <div>
                <label className="text-sm font-medium mb-2 block">Membership Level</label>
                <div className="flex flex-wrap gap-2">
                    {MEMBERSHIP_LEVELS.map((level) => (
                        <Badge
                            key={level}
                            variant={filters.membershipLevels.includes(level) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                                const updated = filters.membershipLevels.includes(level)
                                    ? filters.membershipLevels.filter((l) => l !== level)
                                    : [...filters.membershipLevels, level];
                                onChange({ ...filters, membershipLevels: updated });
                            }}
                        >
                            {level}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Machine Count */}
            <div className="flex flex-col space-y-2">
                <div className="flex justify-between">
                    <span className="text-sm font-medium">Machines</span>
                    <span className="text-xs text-muted-foreground">{filters.minMachines} - {filters.maxMachines === 20 ? '20+' : filters.maxMachines}</span>
                </div>
                <Slider
                    min={0}
                    max={20}
                    step={1}
                    value={[filters.minMachines, filters.maxMachines]}
                    onValueChange={(value) => {
                        const min = value[0] ?? 0;
                        const max = value[1] ?? 20;
                        onChange({ ...filters, minMachines: min, maxMachines: max });
                    }}
                />
            </div>

            {/* Revenue Range */}
            <div className="flex flex-col space-y-2">
                <div className="flex justify-between">
                    <span className="text-sm font-medium">Revenue</span>
                    <span className="text-xs text-muted-foreground">
                        ${(filters.minRevenue || 0).toLocaleString()} -
                        {(filters.maxRevenue === 10000 || !filters.maxRevenue) ? '$10k+' : `$${filters.maxRevenue!.toLocaleString()}`}
                    </span>
                </div>
                <Slider
                    min={0}
                    max={10000}
                    step={500}
                    value={[filters.minRevenue || 0, filters.maxRevenue || 10000]}
                    onValueChange={(value) => {
                        const min = value[0] ?? 0;
                        const max = value[1] ?? 10000;
                        onChange({ ...filters, minRevenue: min, maxRevenue: max });
                    }}
                />
            </div>

            {/* Machine Types */}
            <div>
                <label className="text-sm font-medium mb-2 block">Machine Types</label>
                <div className="flex flex-wrap gap-2">
                    {['Drink', 'Snack', 'Combo', 'Coffee', 'Frozen', 'Retail'].map((type) => (
                        <Badge
                            key={type}
                            variant={(filters.machineTypes || []).includes(type) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                                const current = filters.machineTypes || [];
                                const updated = current.includes(type)
                                    ? current.filter((t) => t !== type)
                                    : [...current, type];
                                onChange({ ...filters, machineTypes: updated });
                            }}
                        >
                            {type}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && !embedded && (
                <Button variant="outline" size="sm" onClick={onReset} className="w-full">
                    Clear All Filters
                </Button>
            )}
        </div>
    );

    if (embedded) {
        return FilterContent;
    }

    return (
        <>
            {/* Filter Toggle Button */}
            <div className="absolute top-4 right-4 z-20">
                <Button
                    variant={hasActiveFilters ? 'default' : 'outline'}
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-white shadow-lg"
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-2">
                            {filters.states.length +
                                filters.membershipLevels.length +
                                (filters.machineTypes?.length || 0)}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-16 right-4 z-20"
                    >
                        <Card className="w-80 p-4 shadow-lg">
                            {FilterContent}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
