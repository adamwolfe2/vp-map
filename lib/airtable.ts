// lib/airtable.ts
// Airtable API client for read-only operations

import Airtable from 'airtable';
import { VendingpreneurClient, ClientsResponse, AirtableError } from './types';
import { API_CONFIG, AIRTABLE_FIELD_MAPPING } from './constants';
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
export async function fetchAllClients(): Promise<VendingpreneurClient[]> {
  try {
    const base = getAirtableBase();
    // Start with seeded mock data to ensure map is populated immediately
    const clients: VendingpreneurClient[] = [...(MOCK_DATA as any)];

    // Fetch all records with pagination
    await base(API_CONFIG.airtable.clientsTable)
      .select({
        pageSize: API_CONFIG.airtable.pageSize,
        // Optional: Add view or filterByFormula here if you have a specific Airtable view
        // view: 'Map Export',
      })
      .eachPage((records, fetchNextPage) => {
        records.forEach((record) => {
          const client = transformAirtableRecord(record);

          // Include all clients even if missing coordinates
          // Map component will filter them out, but StatsBar will count them
          clients.push(client);
        });

        fetchNextPage();
      });

    return clients;
  } catch (error) {
    console.error('Error fetching clients from Airtable:', error);
    throw new Error('Failed to fetch clients. Check Airtable credentials and permissions.');
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
