import { NextResponse } from 'next/server';
import { createLead } from '@/lib/airtable';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { lead, clientId } = body;

        if (!lead) {
            return NextResponse.json({ error: 'Missing lead data' }, { status: 400 });
        }

        // Save to Airtable
        const recordId = await createLead(lead, clientId);

        return NextResponse.json({ success: true, recordId });

    } catch (error) {
        console.error('Error in /api/crm/save:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
