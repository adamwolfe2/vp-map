import { NextResponse } from 'next/server';
import { fetchAllClients } from '@/lib/airtable';

export const dynamic = 'force-dynamic'; // Disable caching for real-time data

export async function GET() {
    try {
        const clients = await fetchAllClients();

        return NextResponse.json({
            success: true,
            data: clients,
            count: clients.length,
        });
    } catch (error) {
        console.error('API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch clients',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
