# Developer Handoff & Architecture Guide

## Architecture Overview

The application follows a **"Smart Client, Dumb UI"** architecture pattern.
- **Data Normalization**: Raw data (from Airtable/Mock) is normalized in `MapView.tsx` into a flat list of `ExtendedLocation` objects. This allows the map to render thousands of points efficiently without complex nested loops during render cycles.
- **Client-Side Processing**: Routing and Clustering are handled client-side to ensure instant feedback without server round-trips.

## Key Decisions

### 1. Mapbox GL JS
We chose Mapbox over Leaflet or Google Maps for its superior WebGL performance with large datasets (>1000 markers) and robust custom styling capabilities.

### 2. Client-Side Routing (Turf.js)
Instead of paying for expensive Matrix APIs, we use `Turf.js` to calculate euclidean distances for basic route optimization. This is sufficient for the "Sales Route" use case where strict turn-by-turn accuracy isn't required for the planning phase.

### 3. PWA Strategy
The app is configured as a PWA (`manifest.json` + `sw.js`) to allow field agents to "install" it on their iPads/iPhones. This provides a native-like experience without App Store overhead.

## Known Limitations

- **Mock Data**: The app currently runs on `lib/mock_data.ts`. This needs to be swapped with a real API call to Airtable or a SQL database.
- **Geocoding limits**: The client-side geocoder has rate limits. Determining coordinates for 500+ un-geocoded clients will require a backend batch job.
- **Permissions**: The Admin Dashboard (`/admin`) currently checks for a simulated user role. This must be connected to a real auth provider (Auth0/Supabase) before production.

## Future Roadmap

- [ ] **Backend Integration**: Replace `MOCK_DATA` with PostgreSQL/Supabase.
- [ ] **User Roles**: Implement RBAC (Role Based Access Control) for "Ambassador" vs "Admin".
- [ ] **Saved Routes**: Allow users to save their optimized routes to a database.
