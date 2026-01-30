'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { MapFilters, US_STATES, MEMBERSHIP_LEVELS } from '@/lib/types';

interface FilterPanelProps {
    filters: MapFilters;
    onChange: (filters: MapFilters) => void;
    onReset: () => void;
}

export default function FilterPanel({ filters, onChange, onReset }: FilterPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    const hasActiveFilters =
        filters.states.length > 0 ||
        filters.membershipLevels.length > 0 ||
        filters.minMachines > 0 ||
        filters.maxMachines < 20;

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
                            {filters.states.length + filters.membershipLevels.length}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Filter Panel */}
            {isOpen && (
                <Card className="absolute top-16 right-4 z-20 w-80 p-4 shadow-lg">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Filters</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

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
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Machines: {filters.minMachines} - {filters.maxMachines}+
                            </label>
                            <Slider
                                min={0}
                                max={20}
                                step={1}
                                value={[filters.minMachines, filters.maxMachines]}
                                onValueChange={([min, max]) =>
                                    onChange({ ...filters, minMachines: min, maxMachines: max })
                                }
                            />
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button variant="outline" size="sm" onClick={onReset} className="w-full">
                                Clear All Filters
                            </Button>
                        )}
                    </div>
                </Card>
            )}
        </>
    );
}
