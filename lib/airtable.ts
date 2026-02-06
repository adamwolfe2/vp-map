// lib/airtable.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Airtable API client for read-only operations

import Airtable from 'airtable';
import { VendingpreneurClient, Location, Machine } from './types';
import {
  API_CONFIG,
  AIRTABLE_FIELD_MAPPING,
  CLIENT_INFO_FIELD_MAPPING,
  LOCATION_DATA_FIELD_MAPPING,
  US_CANADA_BOUNDS
} from './constants';
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

// Helper: Fetch all records from a table
async function fetchAllRecords(tableId: string): Promise<any[]> {
  const base = getAirtableBase();
  const allRecords: any[] = [];

  try {
    await base(tableId).select({
      pageSize: 100
    }).eachPage((records, fetchNextPage) => {
      records.forEach(record => allRecords.push(record));
      fetchNextPage();
    });
    return allRecords;
  } catch (error) {
    console.warn(`Error fetching table ${tableId}:`, error);
    return [];
  }
}

// Phase 13: Mock IoT Generator (Reused)
const generateMockMachines = (count: number, locationId: string): Machine[] => {
  return Array.from({ length: count || 1 }).map((_, idx) => {
    // 10% chance of issue
    const rand = Math.random();
    let status: 'Online' | 'Offline' | 'Error' | 'LowStock' = 'Online';
    if (rand > 0.95) status = 'Error';
    else if (rand > 0.90) status = 'Offline';
    else if (rand > 0.85) status = 'LowStock';

    // Simplified inventory generation for brevity
    return {
      id: `mach-${locationId}-${idx}`,
      serialNumber: `SN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      type: 'Combo',
      status,
      lastHeartbeat: new Date().toISOString(),
      productLevel: Math.floor(Math.random() * 100),
    };
  });
};

const parseNumber = (val: any): number | undefined => {
  if (val === null || val === undefined || val === '') return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
};

// Normalization Helper
const normalizeEmail = (email: any): string => {
  return String(email || '').toLowerCase().trim();
};

/**
 * Main Fetch Function: Integrates 3 Tables
 */
export async function fetchAllClients(): Promise<VendingpreneurClient[]> {
  try {
    const clientsTableId = API_CONFIG.airtable.clientsTable;
    const clientInfoTableId = API_CONFIG.airtable.clientInfoTable;
    const locationsTableId = API_CONFIG.airtable.locationsTable;

    console.log('Fetching data from Airtable tables...');

    // 1. Parallel Fetch
    const [clientsRecords, infoRecords, locationRecords] = await Promise.all([
      fetchAllRecords(clientsTableId),
      fetchAllRecords(clientInfoTableId),
      fetchAllRecords(locationsTableId)
    ]);

    console.log(`Fetched: ${clientsRecords.length} clients, ${infoRecords.length} info records, ${locationRecords.length} locations`);

    // 2. Index Supplementary Data by Email
    const infoMap = new Map<string, any>();
    infoRecords.forEach(r => {
      const email = normalizeEmail(r.fields[CLIENT_INFO_FIELD_MAPPING.email]);
      if (email) infoMap.set(email, r);
    });

    const locationsMap = new Map<string, any[]>();
    locationRecords.forEach(r => {
      const email = normalizeEmail(r.fields[LOCATION_DATA_FIELD_MAPPING.email]);
      if (email) {
        const list = locationsMap.get(email) || [];
        list.push(r);
        locationsMap.set(email, list);
      }
    });

    // 3. Merge & Transform
    const mergedClients: VendingpreneurClient[] = clientsRecords.map(record => {
      const fields = record.fields;
      const personalEmail = normalizeEmail(fields[AIRTABLE_FIELD_MAPPING.personalEmail]);
      // Try business email if personal missing? No, schema says Personal Email is primary.

      const infoRecord = infoMap.get(personalEmail);
      const locRecords = locationsMap.get(personalEmail) || [];

      // Base Client Object
      const client: VendingpreneurClient = {
        id: record.id,
        fullName: String(fields[AIRTABLE_FIELD_MAPPING.fullName] || 'Unknown'),
        clientId: String(fields[AIRTABLE_FIELD_MAPPING.clientId] || ''),
        firstName: fields[AIRTABLE_FIELD_MAPPING.firstName] ? String(fields[AIRTABLE_FIELD_MAPPING.firstName]) : undefined,
        lastName: fields[AIRTABLE_FIELD_MAPPING.lastName] ? String(fields[AIRTABLE_FIELD_MAPPING.lastName]) : undefined,
        membershipLevel: (() => {
          const raw = fields[AIRTABLE_FIELD_MAPPING.membershipLevel];
          if (!raw) return 'Bronze';
          const val = Array.isArray(raw) ? raw[0] : raw;
          const str = String(val).trim();
          return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        })() as any,
        status: String(fields[AIRTABLE_FIELD_MAPPING.status] || ''),
        programLevel: String(fields[AIRTABLE_FIELD_MAPPING.programLevel] || ''),
        dateAdded: fields[AIRTABLE_FIELD_MAPPING.dateAdded] as string,
        programStartDate: fields[AIRTABLE_FIELD_MAPPING.programStartDate] as string,
        daysInProgram: fields[AIRTABLE_FIELD_MAPPING.daysInProgram] as number,
        personalEmail: fields[AIRTABLE_FIELD_MAPPING.personalEmail] as string,
        phoneNumber: fields[AIRTABLE_FIELD_MAPPING.phoneNumber] as string,
        fullAddress: fields[AIRTABLE_FIELD_MAPPING.fullAddress] as string,
        city: fields[AIRTABLE_FIELD_MAPPING.city] as string,
        state: fields[AIRTABLE_FIELD_MAPPING.state] as string,
        zipCode: fields[AIRTABLE_FIELD_MAPPING.zipCode] as string,

        // Allow override of totals from "Client Info" if available
        totalNumberOfMachines: infoRecord
          ? parseNumber(infoRecord.fields[CLIENT_INFO_FIELD_MAPPING.totalMachines])
          : parseNumber(fields[AIRTABLE_FIELD_MAPPING.totalNumberOfMachines]),

        totalNumberOfLocations: infoRecord
          ? parseNumber(infoRecord.fields[CLIENT_INFO_FIELD_MAPPING.totalLocations])
          : parseNumber(fields[AIRTABLE_FIELD_MAPPING.totalNumberOfLocations]),

        shareInsights: infoRecord ? Boolean(infoRecord.fields[CLIENT_INFO_FIELD_MAPPING.shareInsights]) : false,

        vendHubClientId: fields[AIRTABLE_FIELD_MAPPING.vendHubClientId] as string,
        inVendHub: Boolean(fields[AIRTABLE_FIELD_MAPPING.inVendHub]),

        locations: []
      };

      // Process Locations from "Location Data" Table
      if (locRecords.length > 0) {
        client.locations = locRecords.map((lr, idx) => {
          const lFields = lr.fields;
          const machinesCount = parseNumber(lFields[LOCATION_DATA_FIELD_MAPPING.machinesCount]) || 1;
          return {
            id: lr.id,
            name: `Location ${idx + 1}`,
            address: String(lFields[LOCATION_DATA_FIELD_MAPPING.address] || ''),
            propertyType: String(lFields[LOCATION_DATA_FIELD_MAPPING.propertyType] || ''),
            machineType: String(lFields[LOCATION_DATA_FIELD_MAPPING.machineType] || ''),
            monthlyRevenue: parseNumber(lFields[LOCATION_DATA_FIELD_MAPPING.monthlyRevenue]),
            machinesCount: machinesCount,
            locationType: String(lFields[LOCATION_DATA_FIELD_MAPPING.locationType] || ''),
            placementLocation: String(lFields[LOCATION_DATA_FIELD_MAPPING.placementLocation] || ''),
            status: 'Active',
            machines: generateMockMachines(machinesCount, lr.id)
          };
        });
      }

      // Fallback: Use flat fields if NO relational locations found
      if ((!client.locations || client.locations.length === 0) && fields[AIRTABLE_FIELD_MAPPING.streetAddress]) {
        // Create a default "Main" location from the client's own address
        client.locations = [{
          id: `main-${client.id}`,
          name: 'Main Address',
          address: String(fields[AIRTABLE_FIELD_MAPPING.fullAddress] || fields[AIRTABLE_FIELD_MAPPING.streetAddress]),
          status: 'Active',
          machinesCount: client.totalNumberOfMachines || 0,
          monthlyRevenue: client.totalMonthlyRevenue || 0
        }];
      }

      return client;
    });

    // 4. Geocode/Filter Logic (Same as before but on the merged list)
    // IMPORTANT: In this read-only version, we assume coordinates might NOT be in the table yet.
    // If they were scraped, perfect. If not, we might need to rely on the previously implemented cache or just return them without coords
    // and let the frontend map handle it (or use Mapbox geocoding client-side? No, dangerous for API limits).

    // For now, let's assume we proceed with the data we have. 
    // If "Coordinates (for Scraping)" exists, we might parse it? 
    // The previous implementation had a "MOCK_DATA" fallback. 

    if (mergedClients.length === 0) {
      return (MOCK_DATA as any[]).map(normalizeMockData);
    }

    return mergedClients;

  } catch (error) {
    console.error('Error fetching/merging Airtable data:', error);
    return (MOCK_DATA as any[]).map(normalizeMockData);
  }
}

// Re-export these for compatibility if needed
/**
 * Get Airtable record URL for deep linking
 */
export function getAirtableRecordUrl(recordId: string): string {
  const baseId = process.env.AIRTABLE_BASE_ID || '';
  const tableId = API_CONFIG.airtable.clientsTable;
  return `https://airtable.com/${baseId}/${encodeURIComponent(tableId)}/${recordId}`;
}

export async function fetchClientById(recordId: string): Promise<VendingpreneurClient | null> {
  // This is inefficient now as we need to join data. 
  // For single client view, it might be better to fetch just the 3 records searching by ID/Email.
  // But for MVP, `fetchAllClients` is cached by Next.js often.
  // Let's just implement a basic version that re-uses fetchAllClients and finds the one.
  const all = await fetchAllClients();
  return all.find(c => c.id === recordId) || null;
}

export function filterClients(clients: VendingpreneurClient[], searchQuery: string): VendingpreneurClient[] {
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
    platinumMembers: membershipCounts['Platinum'] || 0,
  };
}

export async function createLead(lead: any, forClientId?: string) {
  // Same as before...
  try {
    const base = getAirtableBase();
    const table = API_CONFIG.airtable.leadsTable;
    const fields = {
      "Business Name": lead.name,
      "Address": lead.address,
      "Type": lead.type,
      "Rating": lead.rating,
      "Google Place ID": lead.place_id,
      "Status": "New",
      "Source": "Map Lead Gen",
    };
    if (forClientId) {
      // @ts-expect-error - Dynamic assignment
      fields["Related Client"] = [forClientId];
    }
    const records = await base(table).create([{ fields }]);
    return records?.[0]?.id;
  } catch (error) {
    return `mock-saved-${Date.now()}`;
  }
}

function normalizeMockData(mockItem: any): VendingpreneurClient {
  return {
    ...mockItem,
    fullAddress: mockItem.fullAddress || `${mockItem.fullName}, ${mockItem.city}, ${mockItem.state} ${mockItem.zipCode}`,
    location1Address: mockItem.location1Address || mockItem.fullName,
    locations: mockItem.locations || [{
      id: 'mock-loc-1',
      name: 'Main Location',
      address: mockItem.fullAddress,
      status: 'Active',
      machinesCount: mockItem.totalNumberOfMachines
    }]
  };
}
