'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { VendingpreneurClient, ExtendedLocation } from '@/lib/types';
import { MAPBOX_CONFIG, MEMBERSHIP_COLORS, US_CANADA_BOUNDS } from '@/lib/constants';
import TerritoryControls from './TerritoryControls';
import RoutePanel from './RoutePanel';
import { optimizeRoute } from '@/lib/routing';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

interface MapViewProps {
    clients: VendingpreneurClient[];
    selectedClient: VendingpreneurClient | null;
    onClientSelect: (client: VendingpreneurClient) => void;
}

// Memory cache for geocoding to prevent excessive API calls
const geocodeCache = new Map<string, { lat: number; lng: number }>();

export default function MapView({ clients, selectedClient, onClientSelect }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const draw = useRef<MapboxDraw | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Routing State
    const [routeStops, setRouteStops] = useState<ExtendedLocation[]>([]);
    const [isOptimized, setIsOptimized] = useState(false);

    // Territory Drawing State
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasShape, setHasShape] = useState(false);

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
            // Assuming 'el' and 'loc' would be defined in a context where a marker element is being created.
            // For a Mapbox GL JS map, click handlers are typically added to layers, not directly to data objects.
            // The following code is placed as per the instruction, but it would require 'el' to be a DOM element
            // representing a marker and 'loc' to be the ExtendedLocation object being processed.
            // In a typical Mapbox GL JS setup, you'd use map.on('click', 'layer-id', ...) to handle feature clicks.
            // This snippet would only work if custom HTML markers were being created here.
            // As the instruction is to "make the change faithfully", it's inserted as requested.
            // It's likely this code needs to be moved to where actual marker elements are rendered.
            // el.addEventListener('click', (e) => {
            // e.stopPropagation(); // Prevent map click

            // // If Shift Key is held, add to route
            // if (e.shiftKey || e.metaKey) {
            //     handleAddToRoute(loc); // handleAddToRoute is not defined in this scope
            //     return;
            // }

            // onClientSelect(loc.parentClient);
            // });


            // 2. Sub-locations (1-5)
            // We check for address. If we have it, we try to get coords from cache or our local state.
            for (let i = 1; i <= 5; i++) {
                // @ts-expect-error - Dynamic access to client location properties
                const address = client[`location${i}Address`];
                // @ts-expect-error - Dynamic access to client location properties
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
                    }
                }
            }

            // 3. Linked Locations (Relational)
            if (client.linkedLocations && client.linkedLocations.length > 0) {
                client.linkedLocations.forEach((loc, idx) => {
                    const addressParts = [loc.address, loc.city, loc.state].filter(Boolean);
                    if (addressParts.length === 0) return;

                    const fullAddr = addressParts.join(', ');
                    const cached = geocodeCache.get(fullAddr) || geocodedLocations.get(fullAddr);

                    if (cached) {
                        expanded.push({
                            id: `${client.id}-linked-${loc.id}`,
                            clientId: client.id,
                            type: 'SubLocation',
                            index: 10 + idx, // Offset to avoid collision with 1-5
                            name: `Location ${idx + 1}`,
                            address: fullAddr,
                            machineType: loc.machineType,
                            latitude: cached.lat,
                            longitude: cached.lng,
                            parentClient: client,
                            revenue: loc.monthlyRevenue
                        });
                    }
                });
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
                // @ts-expect-error - Dynamic access to client location properties
                const address = client[`location${i}Address`];
                if (address && typeof address === 'string' && address.length > 5) {
                    const fullAddr = address.includes('Chicago') ? address : `${address}, ${client.state || ''}`;
                    if (!geocodeCache.has(fullAddr) && !geocodedLocations.has(fullAddr)) {
                        toGeocode.add(fullAddr);
                    }
                }
            }

            // Linked Locations
            if (client.linkedLocations) {
                client.linkedLocations.forEach(loc => {
                    const addressParts = [loc.address, loc.city, loc.state].filter(Boolean);
                    if (addressParts.length > 0) {
                        const fullAddr = addressParts.join(', ');
                        if (!geocodeCache.has(fullAddr) && !geocodedLocations.has(fullAddr)) {
                            toGeocode.add(fullAddr);
                        }
                    }
                });
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
                } catch {
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

        return undefined;

    }, [clients, geocodedLocations]); // Re-run when clients change, but be careful of loops


    // Convert expanded locations to GeoJSON
    const geoJsonData = useMemo(() => {
        return {
            type: 'FeatureCollection' as const,
            features: allLocations.map((loc: ExtendedLocation) => ({
                type: 'Feature' as const,
                properties: {
                    id: loc.id,
                    clientId: loc.clientId,
                    membershipLevel: loc.parentClient.membershipLevel || 'Expired',
                    type: loc.type,
                    name: loc.name,
                    machineType: loc.machineType
                },
                geometry: {
                    type: 'Point' as const,
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
            maxBounds: MAPBOX_CONFIG.maxBounds as unknown as mapboxgl.LngLatBoundsLike, // Restrict panning
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

            // Add 3D buildings layer
            map.current.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 14,
                'paint': {
                    'fill-extrusion-color': '#aaa',
                    'fill-extrusion-height': [
                        'interpolate', ['linear'], ['zoom'],
                        14, 0,
                        14.05, ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                        'interpolate', ['linear'], ['zoom'],
                        14, 0,
                        14.05, ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.6
                }
            });

            // Initialize Draw
            draw.current = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: true,
                    trash: true
                },
                defaultMode: 'simple_select'
            });

            map.current.addControl(draw.current, 'top-left');

            // Draw Event Listeners to update UI state
            map.current.on('draw.create', () => setHasShape(true));
            map.current.on('draw.delete', () => setHasShape(false));
            map.current.on('draw.update', () => setHasShape(true));

            // Route Line Layer (Empty initially)
            map.current.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: []
                    }
                }
            });

            map.current.addLayer({
                id: 'route-line',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3b82f6', // Blue-500
                    'line-width': 4,
                    'line-opacity': 0.8
                }
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

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

                // If Shift Key is held, add to route
                if (e.originalEvent.shiftKey || e.originalEvent.metaKey) {
                    const client = clients.find(c => c.id === clientId);
                    if (client) {
                        // We need to construct the ExtendedLocation object again ideally, 
                        // or we can find it in allLocations if we wanted to be efficient.
                        // For now, let's just create a basic one or look it up.
                        // Actually, let's just pass what we can. 
                        // BETTER: Just find it in the clients array and map it to ExtendedLocation logic?
                        // Simpler: The feature properties ALREADY contain what we need?
                        // Yes, let's use allLocations to find it.
                        const loc = allLocations.find(l => l.clientId === clientId && l.type === 'Main'); // Default to main
                        if (loc) {
                            handleAddToRoute(loc);
                            return;
                        }
                    }
                }

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

    // --- Routing Handlers ---
    const handleAddToRoute = (location: ExtendedLocation) => {
        if (routeStops.find(l => l.id === location.id)) return; // No duplicates
        setRouteStops(prev => [...prev, location]);
        setIsOptimized(false);
    };

    const handleRemoveStop = (id: string) => {
        setRouteStops(prev => prev.filter(s => s.id !== id));
        setIsOptimized(false);
    };

    const handleOptimize = useCallback(() => {
        if (routeStops.length < 2) return;
        const optimized = optimizeRoute(routeStops[0]!, routeStops);
        setRouteStops(optimized);
        setIsOptimized(true);

        // Update map layer
        const coordinates = optimized.map(l => [l.longitude, l.latitude]);
        const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: coordinates as number[][]
            }
        };

        if (map.current?.getSource('route')) {
            (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson);
        }
    }, [routeStops]);

    const handleClearRoute = () => {
        setRouteStops([]);
        setIsOptimized(false);
        if (map.current?.getSource('route')) {
            (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: [] }
            });
        }
    };

    // --- Drawing Handlers ---
    const startDrawing = () => {
        if (!draw.current) return;
        draw.current.changeMode('draw_polygon');
        setIsDrawing(true);
    };

    const clearDrawing = () => {
        if (!draw.current) return;
        draw.current.deleteAll();
        setHasShape(false);
        setIsDrawing(false);
    };

    const saveTerritory = () => {
        const data = draw.current?.getAll();
        console.log('Saved Territory:', data);
        setIsDrawing(false);
        // In a real app, send to API
    };

    // --- Overlay logic ---
    // Update Draw state based on mode changes (if user presses Esc)
    useEffect(() => {
        if (!map.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onModeChange = (e: any) => {
            if (e.mode === 'simple_select') {
                setIsDrawing(false);
            }
        };
        map.current.on('draw.modechange', onModeChange);
        return () => {
            map.current?.off('draw.modechange', onModeChange);
        };
    }, []);


    useEffect(() => {
        if (!map.current || !selectedClient || !selectedClient.latitude || !selectedClient.longitude) return;

        // Add to route if "Route Mode" is implicit? 
        // For now, let's just make sure we center. 
        // We will add specific UI buttons in the Popup later if needed, 
        // but for now let's add a double-click handler or similar?
        // Actually, let's stick to the RoutePanel being the list.

        map.current.flyTo({
            center: [selectedClient.longitude, selectedClient.latitude],
            zoom: 14,
            essential: true
        });
    }, [selectedClient]);

    // Enhance Marker Click to add to route if Shift is held
    // NOTE: This logic needs to be inside the marker creation loop or a global listener.
    // Since we destroy/recreate markers, we can pass a callback to the click handler logic.

    return (
        <div className="relative w-full h-full bg-slate-200">
            <div ref={mapContainer} className="!absolute inset-0" />

            <TerritoryControls
                isDrawing={isDrawing}
                hasShape={hasShape} // Mapbox draw handles internal shape state, but we track if one exists
                onStartDraw={startDrawing}
                onClear={clearDrawing}
                onSave={saveTerritory}
                onCancel={() => {
                    draw.current?.changeMode('simple_select');
                    setIsDrawing(false);
                }}
            />

            <RoutePanel
                selectedStops={routeStops}
                onOptimize={handleOptimize}
                onClear={handleClearRoute}
                onRemoveStop={handleRemoveStop}
                isOptimized={isOptimized}
            />
            {/* Loading Indicator for Geocoding */}
            {clients.length > allLocations.length && (
                <div className="absolute bottom-6 right-6 z-50 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs shadow-md">
                    Mapping {allLocations.length} / {clients.length * 2} locations...
                </div>
            )}
        </div>
    );
}
