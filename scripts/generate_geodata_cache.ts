import Airtable from 'airtable';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
const LOCATION_TABLE_ID = 'tblkadlOcE5xxrJCu';
const CLIENTS_TABLE_ID = 'tblwDucKYAsPDVBA2';
const OUTPUT_FILE = path.resolve(process.cwd(), 'lib/geodata_cache.json');

if (!MAPBOX_ACCESS_TOKEN || !AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    console.error('Missing required env variables.');
    process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, 75));
}

async function geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;
        const res = await fetch(url);
        const data = await res.json();

        if (data && data.features && data.features.length > 0) {
            return data.features[0].center; // [lng, lat]
        }
    } catch (err) {
        console.error(`Failed to geocode: ${address}`, err);
    }
    return null;
}

async function generateCache() {
    const cache: Record<string, [number, number]> = {};
    let processed = 0;

    // Load existing cache
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
            Object.assign(cache, existing);
            console.log(`Loaded ${Object.keys(cache).length} existing cached coordinates.`);
        } catch (e) {
            console.warn('Could not read existing cache, starting fresh.');
        }
    }

    // 1. Process Location Data
    console.log(`\n--- Fetching Location Data (${LOCATION_TABLE_ID}) ---`);
    const locRecords = await base(LOCATION_TABLE_ID).select().all();
    console.log(`Found ${locRecords.length} location records.`);

    for (const record of locRecords) {
        const address = record.get('Location Address') as string;
        const id = record.id;

        if (!address) continue;

        if (!cache[id]) {
            console.log(`Geocoding Loc (${processed + 1}): ${address}`);
            const coords = await geocodeAddress(address);
            if (coords) {
                cache[id] = coords;
            }
            await sleep(75);
        }
        processed++;
    }

    // 2. Process Clients Table (Fallback Locations)
    console.log(`\n--- Fetching Clients Table (${CLIENTS_TABLE_ID}) ---`);
    const clientRecords = await base(CLIENTS_TABLE_ID).select().all();
    console.log(`Found ${clientRecords.length} client records.`);

    for (const record of clientRecords) {
        const street = record.get('Street, Building') as string;
        const city = record.get('City') as string;
        const state = record.get('State/Province') as string;
        const id = record.id;

        if (!street) continue;

        // Construct Full Address
        const parts = [street, city, state].filter(Boolean);
        const fullAddr = parts.join(', ');

        if (!cache[id]) {
            console.log(`Geocoding Client (${processed + 1}): ${fullAddr}`);
            const coords = await geocodeAddress(fullAddr);
            if (coords) {
                cache[id] = coords;
            }
            await sleep(75);
        }
        processed++;
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cache, null, 2));
    console.log(`Done! Saved ${Object.keys(cache).length} coordinates to ${OUTPUT_FILE}`);
}

generateCache();
