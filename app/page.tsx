'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
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

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-lg font-medium text-gray-600">Loading Map Data...</p>
          </div>
        </div>
      )}
    </main>
  );
}
