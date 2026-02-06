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
const OUTPUT_FILE = path.resolve(process.cwd(), 'lib/geodata_cache.json');

if (!MAPBOX_ACCESS_TOKEN || !AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    console.error('Missing required env variables.');
    process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    console.log('Fetching locations from Airtable...');
    const records = await base(LOCATION_TABLE_ID).select().all();
    console.log(`Found ${records.length} records.`);

    const cache: Record<string, [number, number]> = {};
    let processed = 0;

    // Load existing cache if exists to resume/update
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
            Object.assign(cache, existing);
            console.log(`Loaded ${Object.keys(cache).length} existing cached coordinates.`);
        } catch (e) {
            console.warn('Could not read existing cache, starting fresh.');
        }
    }

    // Process in chunks to avoid rate limits
    // Mapbox free tier: safe at ~300 req/min? Let's be conservative.
    for (const record of records) {
        const address = record.get('Location Address') as string;
        const id = record.id;

        if (!address) continue;

        // If not in cache or we want to force refresh (optional), geocode
        // Using record ID as key is safest if addresses change, 
        // BUT using Address string as key allows matching even if record ID implies something else? 
        // Let's use Record ID as primary key for robust cache.

        if (!cache[id]) {
            console.log(`Geocoding (${processed + 1}/${records.length}): ${address}`);
            const coords = await geocodeAddress(address);
            if (coords) {
                cache[id] = coords;
            }
            // Throttle: 100ms = 10 req/sec (limit is usually strict! be careful).
            // Mapbox Permanent Geocoding might differ.
            // Let's go with 200ms (5 req/sec).
            await sleep(200);
        }
        processed++;
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cache, null, 2));
    console.log(`Done! Saved ${Object.keys(cache).length} coordinates to ${OUTPUT_FILE}`);
}

generateCache();
