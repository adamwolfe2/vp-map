'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { AlertTriangle } from 'lucide-react';
import MapView from '@/components/map/MapView';
import { filterClients, calculateStats } from '@/lib/airtable';
import { useAirtableData } from '@/hooks/use-airtable';
import { LiveIndicator } from '@/components/ui/live-indicator';
import AppSidebar from '@/components/sidebar/AppSidebar';
import ClientSidebar from '@/components/sidebar/ClientSidebar';
import { VendingpreneurClient, MapFilters } from '@/lib/types';
import { DEFAULT_FILTERS } from '@/lib/constants';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function HomePage() {
  // Centralized data fetching with polling
  const { clients: allClients, isLoading, lastUpdated } = useAirtableData();

  const [selectedClient, setSelectedClient] = useState<VendingpreneurClient | null>(null);
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 300);

  // Compute filtered clients efficiently
  const filteredClients = useMemo(() => {
    let result = allClients;

    // 1. Text Search
    if (debouncedSearch) {
      result = filterClients(result, debouncedSearch);
    }

    // 2. Filter Criteria
    if (filters.states.length > 0) {
      result = result.filter(c => c.state && filters.states.includes(c.state));
    }

    if (filters.membershipLevels.length > 0) {
      result = result.filter(c => c.membershipLevel && filters.membershipLevels.includes(c.membershipLevel));
    }



    if (filters.minMachines > 0 || filters.maxMachines < 20) {
      result = result.filter(c => {
        const machines = c.totalNumberOfMachines || 0;
        return machines >= filters.minMachines && (filters.maxMachines === 20 || machines <= filters.maxMachines);
      });
    }

    if ((filters.minRevenue || 0) > 0 || (filters.maxRevenue || 10000) < 10000) {
      result = result.filter(c => {
        const revenue = c.totalMonthlyRevenue || 0;
        const min = filters.minRevenue || 0;
        const max = filters.maxRevenue || 10000;
        return revenue >= min && (max === 10000 || revenue <= max);
      });
    }

    if (filters.machineTypes && filters.machineTypes.length > 0) {
      result = result.filter(c => {
        // Check flat locations
        for (let i = 1; i <= 5; i++) {
          // @ts-expect-error - Dynamic access to client location properties
          const type = c[`location${i}MachineType`] as string;
          if (type && filters.machineTypes!.some(t => type.includes(t))) return true;
        }
        // Check linked locations
        if (c.linkedLocations) {
          return c.linkedLocations.some(l => l.machineType && filters.machineTypes!.some(t => l.machineType?.includes(t)));
        }
        return false;
      });
    }

    return result;
  }, [allClients, debouncedSearch, filters]);

  // Compute stats based on filtered view
  const stats = useMemo(() => calculateStats(filteredClients), [filteredClients]);

  const handleClientSelect = (client: VendingpreneurClient) => {
    setSelectedClient(client);
  };

  // const handleFilterChange = (newFilters: MapFilters) => {
  //   setFilters(newFilters);
  // };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC closes sidebar
      if (e.key === 'Escape' && selectedClient) {
        setSelectedClient(null);
      }

      // Cmd+K or Ctrl+K focuses search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedClient]);

  // Performance Logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Trigger measurement
    }
  }, [allClients, debouncedSearch, filters, filteredClients.length]);

  if (isLoading) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-white">
        {/* Sidebar Skeleton */}
        <div className="absolute top-4 left-4 z-30 h-10 w-10 rounded-md bg-gray-100 animate-pulse border border-gray-200" />

        {/* Loading centered */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex flex-col items-center gap-3 border border-gray-100">
            <div className="h-6 w-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span className="font-medium text-sm text-gray-500">Loading VendingOS...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-white">
      {/* Map View */}
      <MapView
        clients={filteredClients}
        selectedClient={selectedClient}
        onClientSelect={handleClientSelect}
      />

      {/* App Sidebar (Search, Filters, Stats) */}
      <AppSidebar
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        resultCount={filteredClients.length}
      />

      {/* Bottom Right: Auth & Live Indicator (Clean corner) */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <LiveIndicator lastUpdated={lastUpdated} className="bg-white/90 backdrop-blur rounded-full px-3 py-1 shadow-sm border border-slate-200 text-xs font-medium" />
          <ThemeToggle />
        </div>
      </div>

      {/* Data Quality Warning (Bottom Left) */}
      <div className="pointer-events-none absolute bottom-6 left-4 z-20 flex justify-start">
        {filteredClients.length > 0 && (() => {
          // Correctly calculate unmapped count by checking locations
          const unmappedCount = filteredClients.filter(c => {
            const hasRoot = c.latitude && c.longitude;
            const hasSub = c.locations?.some(l => l.latitude && l.longitude);
            return !hasRoot && !hasSub;
          }).length;

          if (unmappedCount === 0) return null;

          return (
            <div className="pointer-events-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur text-orange-600 rounded-lg shadow-sm text-xs font-medium border border-orange-100">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {unmappedCount} unmapped
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Sidebar Layer */}
      {selectedClient && (
        <ClientSidebar
          client={selectedClient}
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </main>
  );
}
