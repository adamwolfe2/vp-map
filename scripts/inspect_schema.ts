import Airtable from 'airtable';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const apiKey = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
    console.error('Missing Airtable credentials');
    console.log('API Key present:', !!apiKey);
    console.log('Base ID present:', !!baseId);
    process.exit(1);
}

console.log(`Using API Key (Length: ${apiKey.length}, Prefix: ${apiKey.substring(0, 5)}...)`);
console.log(`Using Base ID: ${baseId}`);

const base = new Airtable({ apiKey }).base(baseId);

const TABLES = [
    { name: 'Clients (New)', id: 'tblwDucKYAsPDVBA2' },
    { name: 'Client Info', id: 'tblKaClFLifDEaAWE' },
    { name: 'Location Data', id: 'tblkadlOcE5xxrJCu' }
];

async function inspectTable(tableInfo: { name: string, id: string }) {
    console.log(`\n--- Inspecting ${tableInfo.name} (${tableInfo.id}) ---`);
    try {
        const records = await base(tableInfo.id).select({ maxRecords: 1 }).firstPage();
        if (records.length === 0) {
            console.log('No records found.');
            return;
        }
        const record = records[0];
        if (!record) {
            console.log('No records found in table.');
            return;
        }

        console.log('Sample Record Fields:');
        Object.keys(record.fields).forEach(field => {
            const value = record.fields[field];
            const type = Array.isArray(value) ? 'Array' : typeof value;
            console.log(`- "${field}": ${type} (Example: ${JSON.stringify(value).substring(0, 50)}...)`);
        });
    } catch (error) {
        console.error(`Error inspecting table:`, error);
    }
}

async function main() {
    console.log('Starting Schema Inspection...');
    for (const table of TABLES) {
        await inspectTable(table);
    }
}

main();
