# VendingPreneur Map - Implementation Guide for AntiGravity

## Quick Start

### 1. Initial Setup (10 minutes)

```bash
# Create Next.js project
npx create-next-app@latest vendingpreneur-map --typescript --tailwind --app --no-src-dir

cd vendingpreneur-map

# Install dependencies from provided package.json
npm install

# Install shadcn/ui
npx shadcn-ui@latest init

# Install required shadcn components
npx shadcn-ui@latest add button card input badge select slider accordion separator
```

### 2. Environment Configuration (5 minutes)

Create `.env.local` file:
```bash
# Airtable Credentials (read-only)
AIRTABLE_PERSONAL_ACCESS_TOKEN=your_token_here
AIRTABLE_BASE_ID=your_base_id_here
AIRTABLE_CLIENTS_TABLE_NAME=Clients
AIRTABLE_LOCATIONS_TABLE_NAME=Locations

# Mapbox Token (public, safe for client-side)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiYWRhbXdvbGZlIiwiYSI6ImNtbDFmYTYzNTA3ZXUzZG9mY2R0eWh5OGoifQ.M6oK5RfEWBqLgUJ6-bOSbg
```

**Get Airtable credentials from Adam Wolfe before proceeding.**

### 3. File Structure Setup (5 minutes)

Create this exact folder structure:
```
vendingpreneur-map/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       └── clients/
│           └── route.ts
├── components/
│   ├── map/
│   │   ├── MapView.tsx
│   │   ├── ClientMarker.tsx
│   │   └── MarkerCluster.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   └── FilterPanel.tsx
│   ├── sidebar/
│   │   ├── ClientSidebar.tsx
│   │   ├── ContactCard.tsx
│   │   ├── MetricsGrid.tsx
│   │   └── LocationsList.tsx
│   ├── dashboard/
│   │   └── StatsBar.tsx
│   └── ui/
│       └── (shadcn components auto-generated)
├── lib/
│   ├── airtable.ts
│   ├── types.ts
│   ├── constants.ts
│   └── utils.ts
└── public/
    └── (empty)
```

---

## Phase 1: Core Setup (1-2 hours)

### Step 1.1: Configure Tailwind

Update `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00B67A',
        border: '#E5E5E5',
        background: '#FFFFFF',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

### Step 1.2: Copy Provided Files

Copy these files from the artifacts I created:
1. `lib/types.ts` - All TypeScript interfaces
2. `lib/constants.ts` - Colors, config, field mappings
3. `lib/airtable.ts` - Airtable client functions
4. `lib/utils.ts` - Helper functions (create this with cn() utility)

Create `lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}
```

### Step 1.3: Create API Route

Create `app/api/clients/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { fetchAllClients } from '@/lib/airtable';

export const dynamic = 'force-dynamic'; // Disable caching for real-time data

export async function GET() {
  try {
    const clients = await fetchAllClients();
    
    return NextResponse.json({
      success: true,
      data: clients,
      count: clients.length,
    });
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch clients',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

## Phase 2: Map Component (2-3 hours)

### Step 2.1: Create MapView Component

Create `components/map/MapView.tsx`:
```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { VendingpreneurClient } from '@/lib/types';
import { MAPBOX_CONFIG, MEMBERSHIP_COLORS } from '@/lib/constants';

interface MapViewProps {
  clients: VendingpreneurClient[];
  onClientSelect: (client: VendingpreneurClient) => void;
}

export default function MapView({ clients, onClientSelect }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_CONFIG.token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_CONFIG.style,
      center: [MAPBOX_CONFIG.initialViewport.longitude, MAPBOX_CONFIG.initialViewport.latitude],
      zoom: MAPBOX_CONFIG.initialViewport.zoom,
    });

    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  // Add markers when data changes
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    const markers: mapboxgl.Marker[] = [];

    clients.forEach((client) => {
      if (!client.latitude || !client.longitude) return;

      const color = MEMBERSHIP_COLORS[client.membershipLevel || 'Expired'] || '#999999';

      // Create marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
        el.style.zIndex = '1000';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([client.longitude, client.latitude])
        .addTo(map.current!);

      // Add click handler
      el.addEventListener('click', () => {
        onClientSelect(client);
      });

      markers.push(marker);
    });

    // Cleanup markers on unmount
    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [clients, isMapLoaded, onClientSelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}
```

---

## Phase 3: Search & Filters (2 hours)

### Step 3.1: Create SearchBar

Create `components/search/SearchBar.tsx`:
```typescript
'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export default function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg p-4 w-96">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name, city, or state..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {value && (
        <p className="text-sm text-gray-500 mt-2">
          {resultCount} result{resultCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
```

### Step 3.2: Create FilterPanel

Create `components/search/FilterPanel.tsx`:
```typescript
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
```

---

## Phase 4: Client Sidebar (2-3 hours)

### Step 4.1: Create ClientSidebar

Create `components/sidebar/ClientSidebar.tsx`:
```typescript
'use client';

import { X, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { VendingpreneurClient } from '@/lib/types';
import { MEMBERSHIP_COLORS } from '@/lib/constants';
import { formatCurrency, formatPhoneNumber } from '@/lib/utils';
import { getAirtableRecordUrl } from '@/lib/airtable';
import ContactCard from './ContactCard';
import MetricsGrid from './MetricsGrid';
import LocationsList from './LocationsList';

interface ClientSidebarProps {
  client: VendingpreneurClient;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClientSidebar({ client, isOpen, onClose }: ClientSidebarProps) {
  if (!isOpen) return null;

  const membershipColor = MEMBERSHIP_COLORS[client.membershipLevel || 'Expired'];

  return (
    <div className="fixed right-0 top-0 h-screen w-[400px] bg-white shadow-2xl z-40 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 flex items-start justify-between z-10">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{client.fullName}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              style={{ backgroundColor: membershipColor }}
              className="text-white"
            >
              {client.membershipLevel || 'N/A'}
            </Badge>
            <Badge variant="outline">{client.status}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <ContactCard client={client} />
        <MetricsGrid client={client} />
        <LocationsList client={client} />

        {/* View in Airtable */}
        <a
          href={getAirtableRecordUrl(client.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button variant="outline" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Profile in Airtable
          </Button>
        </a>
      </div>
    </div>
  );
}
```

### Step 4.2: Create ContactCard

Create `components/sidebar/ContactCard.tsx`:
```typescript
import { Mail, Phone, MapPin, Building } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { VendingpreneurClient } from '@/lib/types';
import { formatPhoneNumber } from '@/lib/utils';

interface ContactCardProps {
  client: VendingpreneurClient;
}

export default function ContactCard({ client }: ContactCardProps) {
  return (
    <Card className="p-4 space-y-3">
      {client.personalEmail && (
        <a
          href={`mailto:${client.personalEmail}`}
          className="flex items-center gap-2 text-sm hover:text-primary"
        >
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="truncate">{client.personalEmail}</span>
        </a>
      )}
      
      {client.phoneNumber && (
        <a
          href={`tel:${client.phoneNumber}`}
          className="flex items-center gap-2 text-sm hover:text-primary"
        >
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{formatPhoneNumber(client.phoneNumber)}</span>
        </a>
      )}
      
      {client.businessName && (
        <div className="flex items-center gap-2 text-sm">
          <Building className="h-4 w-4 text-gray-400" />
          <span>{client.businessName}</span>
        </div>
      )}
      
      {client.fullAddress && (
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
          <span className="text-gray-600">{client.fullAddress}</span>
        </div>
      )}
    </Card>
  );
}
```

### Step 4.3: Create MetricsGrid

Create `components/sidebar/MetricsGrid.tsx`:
```typescript
import { Card } from '@/components/ui/card';
import { VendingpreneurClient } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Package, MapPin, DollarSign, Calendar } from 'lucide-react';

interface MetricsGridProps {
  client: VendingpreneurClient;
}

export default function MetricsGrid({ client }: MetricsGridProps) {
  const metrics = [
    {
      label: 'Total Machines',
      value: client.totalNumberOfMachines || 0,
      icon: Package,
    },
    {
      label: 'Total Locations',
      value: client.totalNumberOfLocations || 0,
      icon: MapPin,
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(client.totalMonthlyRevenue || 0),
      icon: DollarSign,
    },
    {
      label: 'Days in Program',
      value: client.daysInProgram || 0,
      icon: Calendar,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <Card key={metric.label} className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <metric.icon className="h-4 w-4 text-primary" />
            <p className="text-xs text-gray-500">{metric.label}</p>
          </div>
          <p className="text-2xl font-semibold">{metric.value}</p>
        </Card>
      ))}
    </div>
  );
}
```

### Step 4.4: Create LocationsList

Create `components/sidebar/LocationsList.tsx`:
```typescript
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { VendingpreneurClient, ClientLocation } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface LocationsListProps {
  client: VendingpreneurClient;
}

export default function LocationsList({ client }: LocationsListProps) {
  const locations: ClientLocation[] = [];

  // Collect all locations (1-5)
  for (let i = 1; i <= 5; i++) {
    const address = client[`location${i}Address` as keyof VendingpreneurClient] as string | undefined;
    if (address) {
      locations.push({
        address,
        machineType: client[`location${i}MachineType` as keyof VendingpreneurClient] as string | undefined,
        monthlyRevenue: client[`location${i}MonthlyRevenue` as keyof VendingpreneurClient] as number | undefined,
        numberOfMachines: client[`location${i}NumberOfMachines` as keyof VendingpreneurClient] as number | undefined,
        propertyType: client[`location${i}PropertyType` as keyof VendingpreneurClient] as string | undefined,
      });
    }
  }

  if (locations.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Locations ({locations.length})</h3>
      <Accordion type="single" collapsible className="w-full">
        {locations.map((location, index) => (
          <AccordionItem key={index} value={`location-${index}`}>
            <AccordionTrigger className="text-sm">
              Location {index + 1}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">{location.address}</p>
                {location.machineType && (
                  <p><span className="font-medium">Machine:</span> {location.machineType}</p>
                )}
                {location.numberOfMachines && (
                  <p><span className="font-medium">Count:</span> {location.numberOfMachines}</p>
                )}
                {location.monthlyRevenue && (
                  <p><span className="font-medium">Revenue:</span> {formatCurrency(location.monthlyRevenue)}</p>
                )}
                {location.propertyType && (
                  <p><span className="font-medium">Type:</span> {location.propertyType}</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </accordion>
    </Card>
  );
}
```

---

## Phase 5: Stats Dashboard (1 hour)

Create `components/dashboard/StatsBar.tsx`:
```typescript
import { Card } from '@/components/ui/card';
import { DashboardStats } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Users, Package, DollarSign, MapPin } from 'lucide-react';

interface StatsBarProps {
  stats: DashboardStats;
  isFiltered: boolean;
}

export default function StatsBar({ stats, isFiltered }: StatsBarProps) {
  const metrics = [
    { label: 'Total Clients', value: stats.totalClients, icon: Users },
    { label: 'Total Machines', value: stats.totalMachines, icon: Package },
    { label: 'Monthly Revenue', value: formatCurrency(stats.totalMonthlyRevenue), icon: DollarSign },
    { label: 'States', value: stats.statesRepresented, icon: MapPin },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
      <Card className="flex items-center gap-6 px-6 py-3 shadow-lg">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center gap-3">
            <metric.icon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-gray-500">{metric.label}</p>
              <p className="text-lg font-semibold">{metric.value}</p>
            </div>
          </div>
        ))}
        {isFiltered && (
          <p className="text-xs text-gray-500 ml-4">(filtered)</p>
        )}
      </Card>
    </div>
  );
}
```

---

## Phase 6: Main Page Assembly (1 hour)

Create `app/page.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
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
  const [filteredClients, setFilteredClients] = useState<VendingpreneurClient[]>([]);
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
          setFilteredClients(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let results = allClients;

    // Apply search
    if (debouncedSearch) {
      results = filterClients(results, debouncedSearch);
    }

    // Apply membership filter
    if (filters.membershipLevels.length > 0) {
      results = results.filter((c) =>
        c.membershipLevel && filters.membershipLevels.includes(c.membershipLevel)
      );
    }

    // Apply state filter
    if (filters.states.length > 0) {
      results = results.filter((c) =>
        c.state && filters.states.includes(c.state)
      );
    }

    // Apply machine count filter
    results = results.filter(
      (c) =>
        (c.totalNumberOfMachines || 0) >= filters.minMachines &&
        (c.totalNumberOfMachines || 0) <= filters.maxMachines
    );

    setFilteredClients(results);
  }, [allClients, debouncedSearch, filters]);

  const stats = calculateStats(filteredClients);
  const hasActiveFilters = 
    searchQuery !== '' || 
    filters.states.length > 0 || 
    filters.membershipLevels.length > 0 ||
    filters.minMachines > 0 ||
    filters.maxMachines < 20;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapView
        clients={filteredClients}
        onClientSelect={setSelectedClient}
      />
      
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        resultCount={filteredClients.length}
      />
      
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
          setSearchQuery('');
        }}
      />
      
      <StatsBar stats={stats} isFiltered={hasActiveFilters} />
      
      {selectedClient && (
        <ClientSidebar
          client={selectedClient}
          isOpen={true}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}
```

---

## Phase 7: Testing & Deploy (1 hour)

### Step 7.1: Local Testing
```bash
npm run dev
# Open http://localhost:3000
# Test:
# - Map loads with markers
# - Search works
# - Filters work
# - Sidebar opens on marker click
# - All data displays correctly
```

### Step 7.2: Deploy to Vercel
```bash
# Push to GitHub first
git init
git add .
git commit -m "Initial VendingPreneur Map"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main

# Deploy on Vercel
# 1. Go to vercel.com
# 2. Import your GitHub repo
# 3. Add environment variables from .env.local
# 4. Deploy
```

---

## Troubleshooting

### Issue: Map not loading
- Check NEXT_PUBLIC_MAPBOX_TOKEN is set
- Verify mapbox-gl CSS is imported
- Check browser console for errors

### Issue: No clients showing
- Verify Airtable credentials in .env.local
- Check API route at /api/clients returns data
- Ensure clients have valid latitude/longitude

### Issue: Markers not clickable
- Check z-index on markers
- Verify onClick handlers are attached
- Test in browser DevTools

---

## Delivery Checklist

- [ ] All components built and working
- [ ] Airtable integration tested with real data
- [ ] Map displays all clients correctly
- [ ] Search and filters functional
- [ ] Sidebar shows complete client details
- [ ] Stats bar updates dynamically
- [ ] Deployed to Vercel
- [ ] Environment variables configured
- [ ] No console errors
- [ ] Responsive on desktop (mobile optional)
- [ ] Share preview URL with Adam Wolfe

---

## Time Estimate
- Phase 1: Setup - 1-2 hours
- Phase 2: Map - 2-3 hours
- Phase 3: Search/Filters - 2 hours
- Phase 4: Sidebar - 2-3 hours
- Phase 5: Stats - 1 hour
- Phase 6: Assembly - 1 hour
- Phase 7: Deploy - 1 hour

**Total: 10-13 hours**

---

## Notes for AntiGravity

1. **Stick to the provided structure** - Don't deviate from component architecture
2. **Use shadcn/ui defaults** - Don't over-customize components
3. **TypeScript strict mode** - No `any` types
4. **Test incrementally** - Build and test each phase before moving on
5. **Keep it simple** - Don't add features not in the PRD

If you get stuck, refer to:
- PRD document for feature requirements
- shadcn/ui docs: ui.shadcn.com
- Mapbox docs: docs.mapbox.com
- Next.js docs: nextjs.org/docs

**Contact**: Adam Wolfe (adamwolfe102@gmail.com)
