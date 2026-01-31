'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import MapView from '@/components/map/MapView';
import SearchBar from '@/components/search/SearchBar';
import FilterPanel from '@/components/search/FilterPanel';
import ClientSidebar from '@/components/sidebar/ClientSidebar';
import StatsBar from '@/components/dashboard/StatsBar';
import { VendingpreneurClient, MapFilters } from '@/lib/types';
import { DEFAULT_FILTERS } from '@/lib/constants';
import { filterClients, calculateStats } from '@/lib/airtable';

export default function HomePage() {
  const [allClients, setAllClients] = useState<VendingpreneurClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<VendingpreneurClient | null>(null);
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch clients on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/clients');
        const data = await response.json();

        if (data.success) {
          setAllClients(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

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
      const start = performance.now();
      // Trigger measurement
      const end = performance.now();
      console.log(`Filter applied in ${(end - start).toFixed(2)}ms`);
      console.log(`Showing ${filteredClients.length} of ${allClients.length} clients`);
    }
  }, [allClients, debouncedSearch, filters, filteredClients.length]);

  if (isLoading) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-background">
        {/* Map skeleton */}
        <div className="absolute inset-0 bg-muted animate-pulse" />

        {/* Search bar skeleton */}
        <div className="absolute top-4 left-4 w-96 h-12 bg-white rounded-lg shadow-lg animate-pulse" />

        {/* Stats bar skeleton */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[600px] h-20 bg-white rounded-lg shadow-lg animate-pulse" />

        {/* Loading text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gray-50">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapView
          clients={filteredClients}
          onClientSelect={handleClientSelect}
        />
      </div>

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
