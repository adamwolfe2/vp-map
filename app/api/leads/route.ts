import { NextResponse } from 'next/server';
import { Lead } from '@/lib/types';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

// Mock data generator for when API key is missing
const generateMockLeads = (lat: number, lng: number, radius: number, type: string, minRating: number = 0, minReviews: number = 0): Lead[] => {
    const leads: Lead[] = [];
    const count = 5 + Math.floor(Math.random() * 5); // 5-10 leads

    for (let i = 0; i < count; i++) {
        const rating = 3.5 + Math.random() * 1.5; // 3.5 - 5.0
        const reviews = Math.floor(Math.random() * 200); // 0 - 200

        // Mock Filter
        if (rating < minRating || reviews < minReviews) continue;

        const r = radius * 1600; // radius in meters
        const offsetLat = (Math.random() - 0.5) * (r / 111000) * 2;
        const offsetLng = (Math.random() - 0.5) * (r / (111000 * Math.cos(lat * Math.PI / 180))) * 2;

        const businessTypes = ['Gym', 'Office', 'Car Dealership', 'School', 'Hospital'];
        const randomType = businessTypes[Math.floor(Math.random() * businessTypes.length)] || 'Gym';
        const selectedType = type === 'all' ? randomType : type;

        leads.push({
            id: `mock-${i}-${Date.now()}`,
            name: `${selectedType} Mock Location ${i + 1}`,
            address: `123 Mock Blvd, Suite ${i + 100}`,
            latitude: lat + offsetLat,
            longitude: lng + offsetLng,
            type: selectedType,
            rating: parseFloat(rating.toFixed(1)),
            user_ratings_total: reviews,
            vicinity: 'Mock Vicinity'
        });
    }
    return leads;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '1'); // miles
    const type = searchParams.get('type') || 'gym';

    if (!lat || !lng) {
        return NextResponse.json({ error: 'Missing latitude or longitude' }, { status: 400 });
    }

    // If no API Key, return Mock Data
    if (!GOOGLE_PLACES_API_KEY) {
        console.warn('⚠️ No Google Places API Key found. Returning mock data.');
        console.log('Environment Check:', {
            GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? 'Set' : 'Missing',
            GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY ? 'Set' : 'Missing',
        });

        const minRating = parseFloat(searchParams.get('minRating') || '0');
        const minReviews = parseInt(searchParams.get('minReviews') || '0');
        const mockLeads = generateMockLeads(lat, lng, radius, type, minRating, minReviews);

        return NextResponse.json({ leads: mockLeads, note: 'Mock Data (No API Key)' });
    }

    console.log('✅ Using Google Places API Key:', GOOGLE_PLACES_API_KEY.substring(0, 5) + '...');

    try {
        // Radius in meters
        const radiusMeters = radius * 1609.34;

        // Google Places Nearby Search (New) or Text Search
        // Using Nearby Search (New) requires FieldMask
        // Falling back to reliable "Places API (Legacy)" Nearby Search or Text Search if preferred,
        // but let's assume we use the standard Nearby Search endpoint which is widely supported.
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&keyword=${type}&key=${GOOGLE_PLACES_API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('Google Places API Error:', data);
            // Fallback to mock if API quota exceeded or error, for demo purposes?
            // Better to return error to UI
            throw new Error(data.error_message || 'Google Places API Error');
        }

        const minRating = parseFloat(searchParams.get('minRating') || '0');
        const minReviews = parseInt(searchParams.get('minReviews') || '0');

        let rawResults = data.results || [];

        // Phase 14: "Trash Filter"
        // Strict filtering to remove low-quality leads
        if (minRating > 0 || minReviews > 0) {
            rawResults = rawResults.filter((place: { rating?: number; user_ratings_total?: number }) => {
                const rating = place.rating || 0;
                const reviews = place.user_ratings_total || 0;
                return rating >= minRating && reviews >= minReviews;
            });
        }

        const leads: Lead[] = rawResults.map((place: {
            place_id: string;
            name: string;
            formatted_address: string;
            vicinity: string;
            geometry: { location: { lat: number; lng: number } };
            rating: number;
            user_ratings_total: number;
            photos: { height: number; width: number; photo_reference: string; html_attributions: string[] }[]
        }) => ({
            id: place.place_id,
            name: place.name,
            address: place.vicinity || place.formatted_address,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            type: type || 'unknown',
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            vicinity: place.vicinity,
            place_id: place.place_id,
            photos: place.photos
        }));

        return NextResponse.json({ leads });

    } catch (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
    }
}
