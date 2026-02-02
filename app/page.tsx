'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { AlertTriangle } from 'lucide-react';
import MapView from '@/components/map/MapView';
import SearchBar from '@/components/search/SearchBar';
import FilterPanel from '@/components/search/FilterPanel';
import ClientSidebar from '@/components/sidebar/ClientSidebar';
import StatsBar from '@/components/dashboard/StatsBar';
import AuthHeader from '@/components/dashboard/AuthHeader';
import { VendingpreneurClient, MapFilters } from '@/lib/types';
import { DEFAULT_FILTERS } from '@/lib/constants';
import { filterClients, calculateStats } from '@/lib/airtable';
import { useAirtableData } from '@/hooks/use-airtable';
import { LiveIndicator } from '@/components/ui/live-indicator';

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

  const handleFilterChange = (newFilters: MapFilters) => {
    setFilters(newFilters);
  };

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
      <div className="relative h-screen w-screen overflow-hidden bg-background">
        {/* Map skeleton */}
        <div className="absolute inset-0 bg-muted animate-pulse" />

        {/* Search bar skeleton */}
        <div className="absolute top-4 left-4 right-4 md:right-auto md:w-96 h-12 bg-white rounded-lg shadow-lg animate-pulse" />

        {/* Stats bar skeleton */}
        <div className="absolute top-24 md:top-4 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] md:w-[600px] h-20 bg-white rounded-lg shadow-lg animate-pulse" />

        {/* Loading text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Loading map data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-50">
      {/* Map View */}
      <MapView
        clients={filteredClients}
        selectedClient={selectedClient}
        onClientSelect={handleClientSelect}
      />

      {/* Top Left: Search & Filter */}
      <div className="absolute top-4 left-4 z-20 w-[calc(100vw-2rem)] md:w-auto flex flex-col gap-2">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={filteredClients.length}
        />

        {/* Auth Entry / Dynamic Header */}
        <AuthHeader />
      </div>

      {/* Top Right: Filter Toggle */}
      <FilterPanel
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Top Interface Layer */}
      <div className="pointer-events-none absolute inset-0 z-10">

        {/* Data Quality Warning */}
        {filteredClients.length > 0 &&
          filteredClients.filter(c => c.latitude && c.longitude).length < filteredClients.length && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full shadow-md text-sm font-medium border border-yellow-200">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  Showing {filteredClients.filter(c => c.latitude && c.longitude).length} mapped clients
                  ({filteredClients.length - filteredClients.filter(c => c.latitude && c.longitude).length} missing location)
                </span>
              </div>
            </div>
          )}

        {/* Search & Filters */}
        <div className="pointer-events-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={filteredClients.length}
          />
          <FilterPanel
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Dashboard Stats */}
        <div className="absolute top-4 left-4 z-20 pointer-events-auto">
          <LiveIndicator lastUpdated={lastUpdated} className="bg-white/90 backdrop-blur rounded-full px-3 py-1 shadow-sm border border-slate-200" />
        </div>

        <StatsBar
          stats={stats}
          isFiltered={filteredClients.length !== allClients.length}
        />
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
