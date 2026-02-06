// lib/types.ts
// TypeScript interfaces matching Airtable schema

export interface VendingpreneurClient {
  // Airtable Record Info
  id: string; // Airtable record ID

  // Basic Info
  fullName: string; // "Full Name" field
  clientId: string; // "Client ID*" field
  firstName?: string;
  lastName?: string;

  // Membership & Status
  membershipLevel: 'Gold' | 'Silver' | 'Bronze' | 'Platinum' | null;
  status: string; // "Status" field
  programLevel?: string; // New: "Current Program Level"
  dateAdded: string; // "Date Added" field
  programStartDate?: string;
  daysInProgram?: number;
  shareInsights?: boolean; // New: From Client Info

  // Contact Info
  personalEmail?: string;
  businessEmail?: string;
  phoneNumber?: string;
  businessName?: string;

  // Location Data
  streetAddress?: string; // "Street, Building" field
  city?: string;
  state?: string; // "State/Province" field
  zipCode?: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;

  // Business Metrics
  totalNumberOfMachines?: number;
  totalNumberOfLocations?: number;
  totalMonthlyRevenue?: number;
  totalNetRevenue?: number;
  machinesPlaced?: number;

  // Location Addresses (1-5)
  location1Address?: string;
  location1MachineType?: string;
  location1MonthlyRevenue?: number;
  location1NumberOfMachines?: number;
  location1PropertyType?: string;

  location2Address?: string;
  location2MachineType?: string;
  location2MonthlyRevenue?: number;
  location2NumberOfMachines?: number;
  location2PropertyType?: string;

  location3Address?: string;
  location3MachineType?: string;
  location3MonthlyRevenue?: number;
  location3NumberOfMachines?: number;
  location3PropertyType?: string;

  location4Address?: string;
  location4MachineType?: string;
  location4MonthlyRevenue?: number;
  location4NumberOfMachines?: number;
  location4PropertyType?: string;

  location5Address?: string;
  location5MachineType?: string;
  location5MonthlyRevenue?: number;
  location5NumberOfMachines?: number;
  location5PropertyType?: string;

  // VendHub Integration
  vendHubClientId?: string;
  inVendHub?: boolean;

  // Additional Fields
  nationalContracts?: string[];
  skoolJoinDate?: string;
  salesRep?: string;
  notes?: string;
  profilePicture?: { url: string; filename: string }[];
  gallery?: { url: string; filename: string }[];

  // Phase 12: Relational Data Architecture
  // The 'locations' array consolidates both legacy (flat) and new (linked) locations.
  locations?: Location[];

  // Legacy Linked Locations (deprecated, use 'locations' instead)
  linkedLocations?: Location[];
}

// Phase 16: Inventory Data
export interface InventoryItem {
  slot: string; // e.g. "A1"
  productName: string;
  price: number;
  stock: number;
  capacity: number;
  imageUrl?: string;
  lastRestocked?: string;
}

// Phase 13: Machine Telemetry
export interface Machine {
  id: string;
  serialNumber: string;
  type: 'Snack' | 'Drink' | 'Combo' | 'Coffee' | 'Retail';
  status: 'Online' | 'Offline' | 'Error' | 'LowStock';
  lastHeartbeat: string; // ISO Date
  productLevel?: number; // 0-100%
  inventory?: InventoryItem[]; // Phase 16
}

export interface Location {
  id: string; // Unique ID (Airtable Record ID or generated)
  name?: string; // e.g. "Main Hub" or "Location 1"
  status?: 'Active' | 'Pending' | 'Closed';
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  machineType?: string;
  propertyType?: string;
  monthlyRevenue?: number;
  machinesCount?: number;
  locationType?: string; // New: "Location Type"
  placementLocation?: string; // New: "Placement Location"
  clientId?: string[]; // Array of linked record IDs
  machines?: Machine[]; // Telemetry Data
}

// Normalized location data for UI display
export interface ClientLocation {
  address: string;
  machineType?: string;
  monthlyRevenue?: number;
  numberOfMachines?: number;
  propertyType?: string;
}

// Filter state
export interface MapFilters {
  searchQuery: string;
  states: readonly string[];
  membershipLevels: readonly string[];
  minMachines: number;
  maxMachines: number;
  minRevenue?: number;
  maxRevenue?: number;
  machineTypes?: string[];
}

// Stats for dashboard
export interface DashboardStats {
  totalClients: number;
  totalMachines: number;
  totalMonthlyRevenue: number;
  statesRepresented: number;
  goldMembers: number;
  silverMembers: number;
  bronzeMembers: number;
}

// Mapbox marker data
export interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  color: string;
  client: VendingpreneurClient;
}

// Flattened location for map rendering
export interface ExtendedLocation {
  id: string;
  clientId: string;
  type: 'Main' | 'SubLocation';
  index?: number; // 0 for main, 1-5 for sub
  name: string; // "Main Hub" or "Location 1"
  address: string;
  machineType?: string;
  latitude?: number;
  longitude?: number;
  revenue?: number;
  parentClient: VendingpreneurClient;

  // Phase 13
  hasIssue?: boolean;
  issueDescription?: string;
}

// API Response types
export interface ClientsResponse {
  records: VendingpreneurClient[];
  offset?: string;
}


export interface LocationsResponse {
  records: Location[];
  offset?: string;
}

export interface Lead {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  rating?: number;
  user_ratings_total?: number;
  place_id?: string;
  vicinity?: string;
  photos?: {
    height: number;
    width: number;
    photo_reference: string;
    html_attributions: string[];
  }[];
}

// Airtable API error
export interface AirtableError {
  error: {
    type: string;
    message: string;
  };
}

// Component props
export interface MapViewProps {
  clients: VendingpreneurClient[];
  selectedClient: VendingpreneurClient | null;
  onClientSelect: (client: VendingpreneurClient | null) => void;
}

export interface ClientSidebarProps {
  client: VendingpreneurClient;
  isOpen: boolean;
  onClose: () => void;
  onLeadsFound?: (leads: Lead[]) => void;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export interface FilterPanelProps {
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
  onReset: () => void;
}

export interface StatsBarProps {
  stats: DashboardStats;
  isFiltered: boolean;
}

// US States list for filter dropdown
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const;

export type USState = typeof US_STATES[number];

// Membership levels
export const MEMBERSHIP_LEVELS = ['Gold', 'Silver', 'Bronze', 'Platinum'] as const;
export type MembershipLevel = typeof MEMBERSHIP_LEVELS[number];

export const MACHINE_TYPES = [
  'Drink',
  'Snack',
  'Combo',
  'Coffee',
  'Frozen',
  'Retail'
] as const;
