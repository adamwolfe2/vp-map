'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { VendingpreneurClient, ExtendedLocation } from '@/lib/types';
import { MAPBOX_CONFIG, MEMBERSHIP_COLORS, US_CANADA_BOUNDS } from '@/lib/constants';

interface MapViewProps {
    clients: VendingpreneurClient[];
    onClientSelect: (client: VendingpreneurClient) => void;
}

// Memory cache for geocoding to prevent excessive API calls
const geocodeCache = new Map<string, { lat: number; lng: number }>();

export default function MapView({ clients, onClientSelect }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // State to store geocoded locations (address -> coords)
    const [geocodedLocations, setGeocodedLocations] = useState<Map<string, { lat: number, lng: number }>>(new Map());

    // Expand clients into multiple locations (Main + Sub-locations)
    const allLocations = useMemo((): ExtendedLocation[] => {
        const expanded: ExtendedLocation[] = [];

        clients.forEach(client => {
            // 1. Main Hub
            if (client.latitude && client.longitude) {
                expanded.push({
                    id: `${client.id}-main`,
                    clientId: client.id,
                    type: 'Main',
                    index: 0,
                    name: 'Main Hub',
                    address: client.fullAddress || '',
                    latitude: client.latitude,
                    longitude: client.longitude,
                    parentClient: client,
                });
            }

            // 2. Sub-locations (1-5)
            // We check for address. If we have it, we try to get coords from cache or our local state.
            for (let i = 1; i <= 5; i++) {
                // @ts-ignore - dynamic access
                const address = client[`location${i}Address`];
                // @ts-ignore
                const type = client[`location${i}MachineType`];

                if (address && typeof address === 'string' && address.length > 5) {
                    const fullAddr = address.includes('Chicago') ? address : `${address}, ${client.state || ''}`; // Simple heuristic
                    const cached = geocodeCache.get(fullAddr) || geocodedLocations.get(fullAddr);

                    if (cached) {
                        expanded.push({
                            id: `${client.id}-loc-${i}`,
                            clientId: client.id,
                            type: 'SubLocation',
                            index: i,
                            name: `Location ${i}`,
                            address: fullAddr,
                            machineType: type,
                            latitude: cached.lat,
                            longitude: cached.lng,
                            parentClient: client,
                        });
                    } else {
                        // Push a placeholder or trigger geocoding?
                        // For now we only render what has coords.
                        // We will trigger geocoding in a useEffect.
                    }
                }
            }
        });

        return expanded;
    }, [clients, geocodedLocations]);

    // Client-side Geocoding Effect (The "Phase 3" magic)
    useEffect(() => {
        if (!clients.length) return;

        const toGeocode = new Set<string>();

        clients.forEach(client => {
            for (let i = 1; i <= 5; i++) {
                // @ts-ignore
                const address = client[`location${i}Address`];
                if (address && typeof address === 'string' && address.length > 5) {
                    const fullAddr = address.includes('Chicago') ? address : `${address}, ${client.state || ''}`;
                    if (!geocodeCache.has(fullAddr) && !geocodedLocations.has(fullAddr)) {
                        toGeocode.add(fullAddr);
                    }
                }
            }
        });

        // Throttle and batch geocoding
        const processQueue = async () => {
            const addresses = Array.from(toGeocode).slice(0, 10); // Process 10 at a time to avoid rate limits
            if (addresses.length === 0) return;

            console.log(`Attempting to geocode ${addresses.length} sub-locations...`);

            for (const addr of addresses) {
                if (geocodeCache.has(addr)) continue;

                try {
                    const token = MAPBOX_CONFIG.token;
                    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addr)}.json?access_token=${token}&limit=1`;
                    const res = await fetch(url);
                    const data = await res.json();

                    if (data.features && data.features.length > 0) {
                        const [lng, lat] = data.features[0].center;

                        // Strict US/Canada Check
                        const { minLat, maxLat, minLng, maxLng } = US_CANADA_BOUNDS;
                        if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
                            geocodeCache.set(addr, { lat, lng });
                            setGeocodedLocations((prev: Map<string, { lat: number, lng: number }>) => new Map(prev).set(addr, { lat, lng }));
                        }
                    }
                } catch (e) {
                    console.warn('Geocoding failed for', addr);
                }

                await new Promise(r => setTimeout(r, 250)); // 4 requests per second max
            }
        };

        // Only run if we have a lot of missing data
        if (toGeocode.size > 0) {
            const timer = setTimeout(processQueue, 1000);
            return () => clearTimeout(timer);
        }

    }, [clients, geocodedLocations]); // Re-run when clients change, but be careful of loops


    // Convert expanded locations to GeoJSON
    const geoJsonData = useMemo(() => {
        return {
            type: 'FeatureCollection',
            features: allLocations.map((loc: ExtendedLocation) => ({
                type: 'Feature',
                properties: {
                    id: loc.id,
                    clientId: loc.clientId,
                    membershipLevel: loc.parentClient.membershipLevel || 'Expired',
                    type: loc.type,
                    name: loc.name,
                    machineType: loc.machineType
                },
                geometry: {
                    type: 'Point',
                    coordinates: [loc.longitude!, loc.latitude!]
                }
            }))
        };
    }, [allLocations]);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = MAPBOX_CONFIG.token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAPBOX_CONFIG.style,
            center: [MAPBOX_CONFIG.initialViewport.longitude, MAPBOX_CONFIG.initialViewport.latitude],
            zoom: MAPBOX_CONFIG.initialViewport.zoom,
            maxBounds: MAPBOX_CONFIG.maxBounds, // Restrict panning
        });

        map.current.on('load', () => {
            setIsMapLoaded(true);
        });

        // Cleanup
        return () => {
            map.current?.remove();
        };
    }, []);

    // Handle Source and Layers for Clustering
    useEffect(() => {
        if (!map.current || !isMapLoaded) return;

        const sourceId = 'clients';

        // Update or Add Source
        const source = map.current.getSource(sourceId) as mapboxgl.GeoJSONSource;

        if (source) {
            source.setData(geoJsonData);
        } else {
            map.current.addSource(sourceId, {
                type: 'geojson',
                data: geoJsonData,
                cluster: true,
                clusterMaxZoom: MAPBOX_CONFIG.clusterMaxZoom,
                clusterRadius: MAPBOX_CONFIG.clusterRadius,
            });

            // 1. Clusters Layer (Circles)
            map.current.addLayer({
                id: 'clusters',
                type: 'circle',
                source: sourceId,
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': [
                        'step',
                        ['get', 'point_count'],
                        '#51bbd6', // Blue for small clusters
                        100,
                        '#f1f075', // Yellow for medium
                        750,
                        '#f28cb1'  // Pink for large
                    ],
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        20,
                        100,
                        30,
                        750,
                        40
                    ]
                }
            });

            // 2. Cluster Count Labels
            map.current.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: sourceId,
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                }
            });

            // 3. Unclustered Points (Individual Clients)
            map.current.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: sourceId,
                filter: ['!', ['has', 'point_count']],
                paint: {
                    // Use a separate color for sub-locations?
                    'circle-color': [
                        'case',
                        ['==', ['get', 'type'], 'SubLocation'],
                        '#818cf8', // Indigo for sub-locations
                        [ // Default logic for Main Hubs
                            'match',
                            ['get', 'membershipLevel'],
                            'Gold', MEMBERSHIP_COLORS.Gold,
                            'Silver', MEMBERSHIP_COLORS.Silver,
                            'Bronze', MEMBERSHIP_COLORS.Bronze,
                            'Platinum', MEMBERSHIP_COLORS.Platinum,
                            MEMBERSHIP_COLORS.Expired // default
                        ]
                    ],
                    'circle-radius': [
                        'case',
                        ['==', ['get', 'type'], 'SubLocation'],
                        5, // Smaller radius for sub-locations
                        8  // Larger radius for main hubs
                    ],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff'
                }
            });

            // Event Handlers

            // Click on cluster -> Zoom in
            // Click on cluster -> Zoom in
            map.current.on('click', 'clusters', (e: mapboxgl.MapMouseEvent) => {
                const features = map.current?.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                const clusterId = features && features[0] && features[0].properties ? features[0].properties.cluster_id : null;

                if (!clusterId || !features || !features[0]) return;

                const center = (features[0].geometry as any).coordinates;

                (map.current?.getSource(sourceId) as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
                    clusterId,
                    (err: Error | null | undefined, zoom: number | null | undefined) => {
                        if (err || !map.current || zoom === null || zoom === undefined) return;
                        map.current.easeTo({
                            center,
                            zoom: zoom
                        });
                    }
                );
            });

            // Click on individual point -> Select client
            // Click on individual point -> Select client
            map.current.on('click', 'unclustered-point', (e: mapboxgl.MapMouseEvent) => {
                const feature = e.features?.[0];
                const clientId = feature?.properties?.clientId; // NOTE: Changed from id to clientId

                if (clientId) {
                    const client = clients.find(c => c.id === clientId);
                    if (client) {
                        onClientSelect(client);
                    }
                }
            });

            // Cursor pointer styling
            const handleMouseEnter = () => {
                if (map.current) map.current.getCanvas().style.cursor = 'pointer';
            };
            const handleMouseLeave = () => {
                if (map.current) map.current.getCanvas().style.cursor = '';
            };

            map.current.on('mouseenter', 'clusters', handleMouseEnter);
            map.current.on('mouseleave', 'clusters', handleMouseLeave);
            map.current.on('mouseenter', 'unclustered-point', handleMouseEnter);
            map.current.on('mouseleave', 'unclustered-point', handleMouseLeave);
        }
    }, [geoJsonData, isMapLoaded, clients, onClientSelect]);

    return (
        <div className="relative w-full h-full bg-slate-200">
            <div ref={mapContainer} className="!absolute inset-0" />

            {/* Loading Indicator for Geocoding */}
            {clients.length > allLocations.length && (
                <div className="absolute bottom-6 right-6 z-50 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs shadow-md">
                    Mapping {allLocations.length} / {clients.length * 2} locations...
                </div>
            )}
        </div>
    );
}
