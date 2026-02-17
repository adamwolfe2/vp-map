import { NextResponse } from 'next/server';
import { Lead } from '@/lib/types';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY;

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

    if (!GOOGLE_PLACES_API_KEY) {
        console.warn('⚠️ No Google Places API Key found. Returning mock data.');
        const minRating = parseFloat(searchParams.get('minRating') || '0');
        const minReviews = parseInt(searchParams.get('minReviews') || '0');
        const mockLeads = generateMockLeads(lat, lng, radius, type, minRating, minReviews);
        return NextResponse.json({ leads: mockLeads, note: 'Mock Data (No API Key)' });
    }

    console.log(`✅ Using API Key: ${GOOGLE_PLACES_API_KEY.substring(0, 5)}...`);

    try {
        const radiusMeters = radius * 1609.34;

        // New Places API (v1) - searchNearby
        // Allows fetching logic fields like websiteUri, nationalPhoneNumber
        const url = 'https://places.googleapis.com/v1/places:searchNearby';

        const requestBody = {
            includedTypes: [type],
            maxResultCount: 20,
            locationRestriction: {
                circle: {
                    center: {
                        latitude: lat,
                        longitude: lng
                    },
                    radius: radiusMeters
                }
            }
        };

        const fieldMask = [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.location',
            'places.rating',
            'places.userRatingCount',
            'places.websiteUri',
            'places.nationalPhoneNumber',
            'places.businessStatus',
            'places.photos'
        ].join(',');

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
                'X-Goog-FieldMask': fieldMask
            },
            body: JSON.stringify(requestBody)
        });

        const data = await res.json();

        if (data.error) {
            console.error('Google Places API Error:', data.error);
            throw new Error(data.error.message || 'Google Places API Error');
        }

        const rawResults = data.places || [];
        const minRating = parseFloat(searchParams.get('minRating') || '0');
        const minReviews = parseInt(searchParams.get('minReviews') || '0');

        // Filter results
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filteredResults = rawResults.filter((place: any) => {
            const rating = place.rating || 0;
            const reviews = place.userRatingCount || 0;
            const status = place.businessStatus;

            // Filter out closed businesses if needed
            if (status === 'CLOSED_TEMPORARILY' || status === 'CLOSED_PERMANENTLY') return false;

            return rating >= minRating && reviews >= minReviews;
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const leads: Lead[] = filteredResults.map((place: any) => ({
            id: place.id,
            name: place.displayName?.text || 'Unknown',
            address: place.formattedAddress || 'No Address',
            latitude: place.location?.latitude || 0,
            longitude: place.location?.longitude || 0,
            type: type,
            rating: place.rating,
            user_ratings_total: place.userRatingCount,
            website: place.websiteUri,
            phoneNumber: place.nationalPhoneNumber,
            businessStatus: place.businessStatus,
            place_id: place.id,
            // Map photos structure if needed, V1 returns `name` (resource name) instead of photo_reference
            // We might need to adjust the UI to handle V1 photo names or skip for now to ensuring contact info is priority.
            // Converting V1 photo resource to legacy structure for compatibility if possible, 
            // otherwise UI might break on photos.
            // For now, let's omit photos to prevent UI errors until UI is updated, 
            // or map simplistic structure if UI just checks existence.
            photos: []
        }));

        return NextResponse.json({ leads });

    } catch (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
    }
}
