import Airtable from 'airtable';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listFields() {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
    const locationTableId = 'tblkadlOcE5xxrJCu'; // Location Data

    if (!baseId || !apiKey) {
        console.error('Missing AIRTABLE_BASE_ID or AIRTABLE_PERSONAL_ACCESS_TOKEN');
        return;
    }

    const base = new Airtable({ apiKey }).base(baseId);

    try {
        const records = await base(locationTableId).select({
            maxRecords: 5,
        }).firstPage();

        if (records.length === 0) {
            console.log('No records found.');
            return;
        }

        const allFields = new Set<string>();
        records.forEach(record => {
            Object.keys(record.fields).forEach(field => allFields.add(field));
        });

        console.log('Available Fields in Location Data:');
        Array.from(allFields).sort().forEach(field => console.log(`- "${field}"`));

    } catch (error) {
        console.error('Error fetching records:', error);
    }
}

listFields();
