// lib/constants.ts
// App-wide constants and configuration

export const COLORS = {
  // Modern Amenities Brand
  primary: '#00B67A',
  primaryHover: '#00A36A',

  // Background & Text
  background: '#FFFFFF',
  textPrimary: '#0A0A0A',
  textSecondary: '#525252',
  border: '#E5E5E5',
  hover: '#FAFAFA',

  // Membership Colors
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  platinum: '#E5E4E2',
  expired: '#999999',

  // Status Colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export const MEMBERSHIP_COLORS: Record<string, string> = {
  Gold: COLORS.gold,
  Silver: COLORS.silver,
  Bronze: COLORS.bronze,
  Platinum: COLORS.platinum,
  Expired: COLORS.expired,
};

// Mapbox configuration
export const MAPBOX_CONFIG = {
  token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
  styleDay: 'mapbox://styles/mapbox/light-v11',
  styleNight: 'mapbox://styles/mapbox/navigation-night-v1', // High contrast "City Lights" base
  style: 'mapbox://styles/mapbox/light-v11', // Default fallback
  initialViewport: {
    latitude: 39.8283,
    longitude: -98.5795,
    zoom: 4,
  },
  clusterRadius: 50,
  clusterMaxZoom: 14,
  // Restrict to North America (US/Canada focus)
  maxBounds: [
    [-179.9, 15.0], // Southwest coordinates (Hawaii/Pacific)
    [-50.0, 85.0]   // Northeast coordinates (Greenland/Canada)
  ],
} as const;

// Geographic bounds for data filtering (strict US/Canada filtering)
export const US_CANADA_BOUNDS = {
  minLat: 18.0,   // Southern US (approx)
  maxLat: 85.0,   // Northern Canada
  minLng: -180.0, // Western Aleutians
  maxLng: -50.0,  // Eastern Canada
} as const;

// Filter defaults
export const DEFAULT_FILTERS = {
  searchQuery: '',
  states: [],
  membershipLevels: [],
  minMachines: 0,
  maxMachines: 20,
  minRevenue: 0,
  maxRevenue: 10000,
  machineTypes: [],
};

// API configuration
export const API_CONFIG = {
  airtable: {
    baseId: process.env.AIRTABLE_BASE_ID || '',
    clientsTable: 'tblwDucKYAsPDVBA2', // Clients (New)
    clientInfoTable: 'tblKaClFLifDEaAWE', // Client Info
    locationsTable: 'tblkadlOcE5xxrJCu', // Location Data
    leadsTable: process.env.AIRTABLE_LEADS_TABLE_NAME || 'Leads',
    maxRecords: 100, // Airtable API limit per request
    pageSize: 100,
  },
  cache: {
    revalidate: 300, // 5 minutes in seconds
  },
} as const;

// Field mappings from Airtable to our types
export const AIRTABLE_FIELD_MAPPING = {
  id: 'Record ID',
  fullName: 'Full Name',
  clientId: 'Client ID*',
  firstName: 'First Name',
  lastName: 'Last Name',
  membershipLevel: 'Membership Level',
  status: 'Status (Program Level)', // Updated from schema
  programLevel: 'Current Program Level', // New
  dateAdded: 'Date Added',
  programStartDate: 'Program Start Date',
  daysInProgram: 'Days in Program',
  personalEmail: 'Personal Email',
  businessEmail: 'Business Email', // Might not exist in new schema, but keeping for safety
  phoneNumber: 'Phone Number',
  businessName: 'Business Name', // Might be missing
  streetAddress: 'Street, Building',
  city: 'City',
  state: 'State/Province',
  zipCode: 'Zip Code',
  fullAddress: 'Full Address',
  // Coordinates might be computed or from specific fields if available
  // New schema has "Coordinates (for Scraping)" but we might strictly use geocoding
  totalNumberOfMachines: 'Total Number of Machines', // Will overwrite with Client Info data
  totalNumberOfLocations: 'Total Number of Locations', // Will overwrite with Client Info data

  vendHubClientId: 'VendHub Client ID',
  inVendHub: 'invited_to_vendhub',
  nationalContracts: 'National Contracts', // Check if exists
  skoolJoinDate: 'Skool Join Date', // Check if exists
  salesRep: 'Sales Rep', // Check if exists
} as const;

export const CLIENT_INFO_FIELD_MAPPING = {
  email: 'Current Email to Reach You',
  phoneNumber: 'Phone Number',
  totalLocations: 'Total Number of Locations',
  totalMachines: 'Total Number of Machines',
  shareInsights: 'Share Insights',
} as const;

export const LOCATION_DATA_FIELD_MAPPING = {
  email: 'Email Address', // Join Key
  address: 'Location Address',
  propertyType: 'Property Type',
  machineType: 'Machine Type',
  monthlyRevenue: 'Monthly Revenue',
  machinesCount: 'Number of Machines',
  locationType: 'Location Type',
  placementLocation: 'Placement Location',
} as const;

export const LOCATIONS_FIELD_MAPPING = {
  id: 'id',
  address: 'Address',
  city: 'City',
  state: 'State',
  zip: 'Zip Code',
  machineType: 'Machine Type',
  propertyType: 'Property Type',
  monthlyRevenue: 'Monthly Revenue',
  machinesCount: 'Number of Machines',
  client: 'Client', // Linked record to Clients table
} as const;

// Responsive breakpoints (Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Animation durations (ms)
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Z-index layers
export const Z_INDEX = {
  mapControls: 10,
  searchBar: 20,
  filterPanel: 20,
  statsBar: 30,
  sidebar: 40,
  modal: 50,
  tooltip: 60,
} as const;

// Sidebar width
export const SIDEBAR_WIDTH = 400; // pixels

// Search debounce delay
export const SEARCH_DEBOUNCE_MS = 300;
