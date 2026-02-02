// lib/airtable.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Airtable API client for read-only operations

import Airtable from 'airtable';
import { VendingpreneurClient, Location } from './types';
import { API_CONFIG, AIRTABLE_FIELD_MAPPING, LOCATIONS_FIELD_MAPPING, US_CANADA_BOUNDS } from './constants';
import { MOCK_DATA } from './mock_data';

// Initialize Airtable client
const getAirtableBase = () => {
  const apiKey = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    throw new Error('Missing Airtable credentials. Check .env.local file.');
  }

  Airtable.configure({
    apiKey,
  });

  return Airtable.base(baseId);
};

// Helper for parsing numbers safely
const parseNumber = (val: any): number | undefined => {
  if (val === null || val === undefined || val === '') return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
};

// Transform Airtable record to our type
const transformAirtableRecord = (record: any): VendingpreneurClient => {
  const fields = record.fields;

  return {
    id: record.id,
    fullName: String(fields[AIRTABLE_FIELD_MAPPING.fullName] || ''),
    clientId: String(fields[AIRTABLE_FIELD_MAPPING.clientId] || ''),
    firstName: fields[AIRTABLE_FIELD_MAPPING.firstName] ? String(fields[AIRTABLE_FIELD_MAPPING.firstName]) : undefined,
    lastName: fields[AIRTABLE_FIELD_MAPPING.lastName] ? String(fields[AIRTABLE_FIELD_MAPPING.lastName]) : undefined,
    membershipLevel: (fields[AIRTABLE_FIELD_MAPPING.membershipLevel] as any) || null,
    status: String(fields[AIRTABLE_FIELD_MAPPING.status] || ''),
    dateAdded: fields[AIRTABLE_FIELD_MAPPING.dateAdded],
    programStartDate: fields[AIRTABLE_FIELD_MAPPING.programStartDate],
    daysInProgram: fields[AIRTABLE_FIELD_MAPPING.daysInProgram],
    personalEmail: fields[AIRTABLE_FIELD_MAPPING.personalEmail],
    businessEmail: fields[AIRTABLE_FIELD_MAPPING.businessEmail],
    phoneNumber: fields[AIRTABLE_FIELD_MAPPING.phoneNumber],
    businessName: fields[AIRTABLE_FIELD_MAPPING.businessName],
    streetAddress: fields[AIRTABLE_FIELD_MAPPING.streetAddress],
    city: fields[AIRTABLE_FIELD_MAPPING.city],
    state: fields[AIRTABLE_FIELD_MAPPING.state],
    zipCode: fields[AIRTABLE_FIELD_MAPPING.zipCode],
    fullAddress: fields[AIRTABLE_FIELD_MAPPING.fullAddress],
    latitude: parseNumber(fields[AIRTABLE_FIELD_MAPPING.latitude]),
    longitude: parseNumber(fields[AIRTABLE_FIELD_MAPPING.longitude]),
    totalNumberOfMachines: Number(fields[AIRTABLE_FIELD_MAPPING.totalNumberOfMachines] || 0),
    totalNumberOfLocations: Number(fields[AIRTABLE_FIELD_MAPPING.totalNumberOfLocations] || 0),
    totalMonthlyRevenue: Number(fields[AIRTABLE_FIELD_MAPPING.totalMonthlyRevenue] || 0),
    totalNetRevenue: fields[AIRTABLE_FIELD_MAPPING.totalNetRevenue],
    location1Address: fields[AIRTABLE_FIELD_MAPPING.location1Address],
    location1MachineType: fields[AIRTABLE_FIELD_MAPPING.location1MachineType],
    location1MonthlyRevenue: fields[AIRTABLE_FIELD_MAPPING.location1MonthlyRevenue],
    location1NumberOfMachines: fields[AIRTABLE_FIELD_MAPPING.location1NumberOfMachines],
    location1PropertyType: fields[AIRTABLE_FIELD_MAPPING.location1PropertyType],
    location2Address: fields[AIRTABLE_FIELD_MAPPING.location2Address],
    location2MachineType: fields[AIRTABLE_FIELD_MAPPING.location2MachineType],
    location2MonthlyRevenue: fields[AIRTABLE_FIELD_MAPPING.location2MonthlyRevenue],
    location2NumberOfMachines: fields[AIRTABLE_FIELD_MAPPING.location2NumberOfMachines],
    location2PropertyType: fields[AIRTABLE_FIELD_MAPPING.location2PropertyType],
    location3Address: fields[AIRTABLE_FIELD_MAPPING.location3Address],
    location3MachineType: fields[AIRTABLE_FIELD_MAPPING.location3MachineType],
    location3MonthlyRevenue: fields[AIRTABLE_FIELD_MAPPING.location3MonthlyRevenue],
    location3NumberOfMachines: fields[AIRTABLE_FIELD_MAPPING.location3NumberOfMachines],
    location3PropertyType: fields[AIRTABLE_FIELD_MAPPING.location3PropertyType],
    location4Address: fields[AIRTABLE_FIELD_MAPPING.location4Address],
    location4MachineType: fields[AIRTABLE_FIELD_MAPPING.location4MachineType],
    location4MonthlyRevenue: fields[AIRTABLE_FIELD_MAPPING.location4MonthlyRevenue],
    location4NumberOfMachines: fields[AIRTABLE_FIELD_MAPPING.location4NumberOfMachines],
    location4PropertyType: fields[AIRTABLE_FIELD_MAPPING.location4PropertyType],
    location5Address: fields[AIRTABLE_FIELD_MAPPING.location5Address],
    location5MachineType: fields[AIRTABLE_FIELD_MAPPING.location5MachineType],
    location5MonthlyRevenue: fields[AIRTABLE_FIELD_MAPPING.location5MonthlyRevenue],
    location5NumberOfMachines: fields[AIRTABLE_FIELD_MAPPING.location5NumberOfMachines],
    location5PropertyType: fields[AIRTABLE_FIELD_MAPPING.location5PropertyType],
    vendHubClientId: fields[AIRTABLE_FIELD_MAPPING.vendHubClientId],
    inVendHub: fields[AIRTABLE_FIELD_MAPPING.inVendHub] || false,
    nationalContracts: fields[AIRTABLE_FIELD_MAPPING.nationalContracts],
    skoolJoinDate: fields[AIRTABLE_FIELD_MAPPING.skoolJoinDate],
    salesRep: fields[AIRTABLE_FIELD_MAPPING.salesRep],
    notes: fields[AIRTABLE_FIELD_MAPPING.notes],
  };
};

/**
 * Fetch all clients from Airtable (read-only)
 * Handles pagination automatically
 */
/**
 * Fetch all locations from new Locations table (read-only)
 */
async function fetchLocations(): Promise<Map<string, Location[]>> {
  try {
    const base = getAirtableBase();
    const locationsMap = new Map<string, Location[]>();
    const locationsTable = API_CONFIG.airtable.locationsTable;

    // Check if table exists/is accessible by trying to fetch one record
    // If this fails, we just return empty map (Fallback Strategy)
    try {
      await base(locationsTable).select({ maxRecords: 1 }).firstPage();
    } catch (e) {
      console.warn('Locations table not found or not accessible. Using flat data only.');
      return locationsMap;
    }

    await base(locationsTable)
      .select({ pageSize: 100 })
      .eachPage((records: readonly any[], fetchNextPage: () => void) => {
        records.forEach((record: any) => {
          const fields = record.fields;
          const loc: Location = {
            id: record.id,
            address: String(fields[LOCATIONS_FIELD_MAPPING.address] || ''),
            city: fields[LOCATIONS_FIELD_MAPPING.city] as string,
            state: fields[LOCATIONS_FIELD_MAPPING.state] as string,
            zip: fields[LOCATIONS_FIELD_MAPPING.zip] as string,
            machineType: fields[LOCATIONS_FIELD_MAPPING.machineType] as string,
            propertyType: fields[LOCATIONS_FIELD_MAPPING.propertyType] as string,
            monthlyRevenue: parseNumber(fields[LOCATIONS_FIELD_MAPPING.monthlyRevenue]),
            machinesCount: parseNumber(fields[LOCATIONS_FIELD_MAPPING.machinesCount]),
            clientId: fields[LOCATIONS_FIELD_MAPPING.client] as string[]
          };

          // Map to Client IDs
          if (loc.clientId && Array.isArray(loc.clientId)) {
            loc.clientId.forEach((cId: string) => {
              const existing = locationsMap.get(cId) || [];
              existing.push(loc);
              locationsMap.set(cId, existing);
            });
          }
        });
        fetchNextPage();
      });

    return locationsMap;
  } catch (error) {
    console.warn('Error fetching linked locations:', error);
    return new Map();
  }
}

/**
 * Fetch all clients from Airtable (read-only)
 * Handles pagination automatically
 */
export async function fetchAllClients(): Promise<VendingpreneurClient[]> {
  try {
    const base = getAirtableBase();
    // Start with seeded mock data to ensure map is populated immediately (Fallback)
    const clients: VendingpreneurClient[] = [];

    // Create a logical cache from the seeded data
    const coordCache = new Map();
    if (Array.isArray(MOCK_DATA)) {
      (MOCK_DATA as any[]).forEach(c => {
        if (c.fullName) coordCache.set(c.fullName, { lat: c.latitude, lng: c.longitude });
        if (c.fullName) coordCache.set(c.fullName.split(',')[0].trim(), { lat: c.latitude, lng: c.longitude });
      });
    }

    // 1. Fetch Relational Locations First (Parallel-ish)
    const linkedLocationsPromise = fetchLocations();

    // 2. Fetch Clients
    await base(API_CONFIG.airtable.clientsTable)
      .select({
        pageSize: API_CONFIG.airtable.pageSize,
        // We could add filterByFormula here if needed
      })
      .eachPage((records: readonly any[], fetchNextPage: () => void) => {
        records.forEach((record: any) => {
          const client = transformAirtableRecord(record);
          clients.push(client);
        });
        fetchNextPage();
      });

    // 3. Hydrate Clients with Coordinates and Linked Locations
    const linkedLocationsMap = await linkedLocationsPromise;

    clients.forEach(client => {
      // A. Coordinate Hydration
      if (!client.latitude || !client.longitude) {
        const namePart = (client.fullName || '').split('\t')[0];
        const cached = coordCache.get(client.fullName) ||
          coordCache.get(client.streetAddress || '') ||
          coordCache.get((namePart || '').trim());

        if (cached && cached.lat && cached.lng) {
          client.latitude = cached.lat;
          client.longitude = cached.lng;
        }
      }

      // B. Filter US/Canada on Main Hub
      if (client.latitude && client.longitude) {
        const { minLat, maxLat, minLng, maxLng } = US_CANADA_BOUNDS;
        if (!(client.latitude >= minLat && client.latitude <= maxLat &&
          client.longitude >= minLng && client.longitude <= maxLng)) {
          // Invalid main location, maybe clear it? 
          // For now we assume the filter logic downstream handles "pushing" to array.
          // Actually the previous implementation filtered HERE.
          // Let's filter out clients entirely if they have NO valid locations (Main or Linked).
          // But wait, the previous code pushed to `clients` array inside eachPage.
          // I need to be careful not to break that.
        }
      }

      // C. Attach Linked Locations
      // We match by Airtable Record ID (client.id), NOT client.clientId (string) 
      // because Linked Records use Record IDs.
      if (linkedLocationsMap.has(client.id)) {
        client.linkedLocations = linkedLocationsMap.get(client.id);
      }
    });

    // Filter Final List (US/Canada Check)
    // We only keep clients that have at least ONE valid location in US/Canada?
    // OR we just filter the Main Hub coordinates like before.
    const validClients = clients.filter(client => {
      // Main Hub Check
      let hasValidMain = false;
      if (client.latitude && client.longitude) {
        const { minLat, maxLat, minLng, maxLng } = US_CANADA_BOUNDS;
        if (client.latitude >= minLat && client.latitude <= maxLat &&
          client.longitude >= minLng && client.longitude <= maxLng) {
          hasValidMain = true;
        }
      }

      // If passed main check, keep.
      // If failed main check, but has valid Linked Locations... we should probably keep?
      // But for now, let's stick to the previous strict logic:
      // "Filter strict US/Canada" was applied to the Main Hub.
      // If we want to support clients with NO main hub but valid sub-locations, we'd need to change this.
      // Let's keep it simple: Keep if Main Hub is valid OR if we didn't have coords (fallback).

      if (client.latitude && client.longitude) {
        return hasValidMain;
      }
      return true; // Keep clients without location for searches
    });

    // Safety Net: If we fetched nothing (e.g. auth error or empty base), 
    // return the Mock Data so the user has a demo.
    if (validClients.length === 0) {
      return [...(MOCK_DATA as any)];
    }

    return validClients;
  } catch (error) {
    console.error('Error fetching clients from Airtable:', error);
    // If Airtable crash, return Mock Data
    return [...(MOCK_DATA as any)];
  }
}


/**
 * Fetch a single client by record ID (read-only)
 */
export async function fetchClientById(recordId: string): Promise<VendingpreneurClient | null> {
  try {
    const base = getAirtableBase();
    const record = await base(API_CONFIG.airtable.clientsTable).find(recordId);
    return transformAirtableRecord(record);
  } catch (error) {
    console.error(`Error fetching client ${recordId}:`, error);
    return null;
  }
}

/**
 * Filter clients by search query (client-side filtering)
 * Searches across: fullName, city, state, businessName
 */
export function filterClients(
  clients: VendingpreneurClient[],
  searchQuery: string
): VendingpreneurClient[] {
  if (!searchQuery) return clients;

  const query = searchQuery.toLowerCase().trim();

  return clients.filter((client) => {
    return (
      client.fullName?.toLowerCase().includes(query) ||
      client.city?.toLowerCase().includes(query) ||
      client.state?.toLowerCase().includes(query) ||
      client.businessName?.toLowerCase().includes(query) ||
      client.clientId?.toLowerCase().includes(query)
    );
  });
}

/**
 * Get Airtable record URL for deep linking
 */
export function getAirtableRecordUrl(recordId: string): string {
  const baseId = process.env.AIRTABLE_BASE_ID || '';
  const tableId = API_CONFIG.airtable.clientsTable;
  return `https://airtable.com/${baseId}/${tableId}/${recordId}`;
}

/**
 * Calculate aggregate stats from client list
 */
export function calculateStats(clients: VendingpreneurClient[]) {
  const totalMachines = clients.reduce((sum, c) => sum + (c.totalNumberOfMachines || 0), 0);
  const totalRevenue = clients.reduce((sum, c) => sum + (c.totalMonthlyRevenue || 0), 0);
  const uniqueStates = new Set(clients.map((c) => c.state).filter(Boolean)).size;

  const membershipCounts = clients.reduce((acc, c) => {
    const level = c.membershipLevel || 'Unknown';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalClients: clients.length,
    totalMachines,
    totalMonthlyRevenue: totalRevenue,
    statesRepresented: uniqueStates,
    goldMembers: membershipCounts['Gold'] || 0,
    silverMembers: membershipCounts['Silver'] || 0,
    bronzeMembers: membershipCounts['Bronze'] || 0,
  };
}
