'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { VendingpreneurClient, ExtendedLocation, Lead } from '@/lib/types';
import { MAPBOX_CONFIG, MEMBERSHIP_COLORS, US_CANADA_BOUNDS } from '@/lib/constants';
import TerritoryControls from './TerritoryControls';
import RoutePanel from './RoutePanel';
import { optimizeRoute } from '@/lib/routing';
import { useTheme } from '@/contexts/ThemeContext';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

interface MapViewProps {
    clients: VendingpreneurClient[];
    selectedClient: VendingpreneurClient | null;
    onClientSelect: (client: VendingpreneurClient) => void;
    leads?: Lead[];
}

// Memory cache for geocoding to prevent excessive API calls
const geocodeCache = new Map<string, { lat: number; lng: number }>();

export default function MapView({ clients, selectedClient, onClientSelect, leads = [] }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    // ... (keep existing state)

    // Convert leads to GeoJSON
    const leadsGeoJson = useMemo(() => {
        return {
            type: 'FeatureCollection' as const,
            features: leads.map((lead) => ({
                type: 'Feature' as const,
                properties: {
                    id: lead.id,
                    name: lead.name,
                    address: lead.address,
                    type: 'Lead',
                    businessType: lead.type
                },
                geometry: {
                    type: 'Point' as const,
                    coordinates: [lead.longitude, lead.latitude]
                }
            }))
        };
    }, [leads]);


    const draw = useRef<MapboxDraw | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Routing State
    const [routeStops, setRouteStops] = useState<ExtendedLocation[]>([]);
    const [isOptimized, setIsOptimized] = useState(false);

    // Territory Drawing State
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasShape, setHasShape] = useState(false);

    // Geocoding State
    const [geocodingQueueSize, setGeocodingQueueSize] = useState(0);

    // State to store geocoded locations (address -> coords)
    const [geocodedLocations, setGeocodedLocations] = useState<Map<string, { lat: number, lng: number }>>(new Map());

    // Stable access to handlers/data to avoid effect re-runs
    const latestRef = useRef({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handleAddToRoute: (l: ExtendedLocation) => { },
        onClientSelect,
        allLocations: [] as ExtendedLocation[]
    });

    useEffect(() => {
        latestRef.current = { handleAddToRoute, onClientSelect, allLocations };
    });

    // Update Leads Source
    useEffect(() => {
        if (!map.current || !isMapLoaded) return;

        const source = map.current.getSource('leads') as mapboxgl.GeoJSONSource;
        if (source) {
            source.setData(leadsGeoJson);
        }
    }, [leadsGeoJson, isMapLoaded]);

    // Expand clients into multiple locations (Main + Sub-locations)
    const allLocations = useMemo((): ExtendedLocation[] => {
        const expanded: ExtendedLocation[] = [];

        clients.forEach(client => {
            // 1. Maintain Main Hub (Legacy/Fallback) logic 
            // In the new model, the "Main Hub" should ideally be in client.locations[0] or explicitly typed.
            // But for backward compatibility with the rest of the app that expects client.latitude/longitude to be the "Hub",
            // we will keep pushing this specific entry if we want the "Pulsing Hub" effect.
            // However, strictly speaking, client.locations includes *everything*.
            // Let's iterate client.locations and enhance them.

            if (client.locations && client.locations.length > 0) {
                client.locations.forEach((loc, idx) => {
                    const isMain = idx === 0; // Assume first is main for now, or check loc.name === 'Main Location'

                    // Resolve Coordinates
                    let lat = loc.latitude;
                    let lng = loc.longitude;

                    // If missing on location object, try client root fallback if it's the main location
                    if ((!lat || !lng) && isMain) {
                        lat = client.latitude;
                        lng = client.longitude;
                    }

                    // If still missing, check cache
                    if (!lat || !lng) {
                        const fullAddr = loc.address;
                        const addressParts = [loc.address, loc.city, loc.state].filter(Boolean).join(', ');
                        const lookup = fullAddr || addressParts;

                        if (lookup) {
                            const cached = geocodeCache.get(lookup) || geocodedLocations.get(lookup);
                            if (cached) {
                                lat = cached.lat;
                                lng = cached.lng;
                            }
                        }
                    }

                    if (lat && lng) {
                        // Check for issues (Offline or Error)
                        const offlineMachine = loc.machines?.find(m => m.status === 'Offline' || m.status === 'Error');
                        const hasIssue = !!offlineMachine;
                        const issueDesc = offlineMachine ? `${offlineMachine.status}: ${offlineMachine.type} (${offlineMachine.serialNumber})` : undefined;

                        expanded.push({
                            id: loc.id,
                            clientId: client.id,
                            type: isMain ? 'Main' : 'SubLocation',
                            index: idx,
                            name: loc.name || `Location ${idx + 1}`,
                            address: loc.address || '',
                            machineType: loc.machineType,
                            latitude: lat,
                            longitude: lng,
                            parentClient: client,
                            revenue: loc.monthlyRevenue,
                            hasIssue,
                            issueDescription: issueDesc
                        });
                    }
                });
            } else {
                // FALLBACK: If client.locations is somehow empty (older implementation catch), do the old Main Hub push
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
            }
        });

        return expanded;
    }, [clients, geocodedLocations]);

    // Client-side Geocoding Effect (The "Phase 3" magic)
    useEffect(() => {
        if (!clients.length) return;

        const toGeocode = new Set<string>();

        clients.forEach(client => {
            if (client.locations) {
                client.locations.forEach(loc => {
                    // Skip if server already provided coordinates
                    if (loc.latitude && loc.longitude) return;

                    let lookupAddress = loc.address;
                    // Heuristics to improve geocoding quality
                    if (lookupAddress && !lookupAddress.includes(',')) {
                        // If just "123 Main St", append City/State
                        const parts = [lookupAddress, loc.city || client.city, loc.state || client.state].filter(Boolean);
                        lookupAddress = parts.join(', ');
                    }

                    if (lookupAddress && !geocodeCache.has(lookupAddress) && !geocodedLocations.has(lookupAddress)) {
                        toGeocode.add(lookupAddress);
                    }
                });
            }
        });

        // Throttle and batch geocoding
        const processQueue = async () => {
            const addresses = Array.from(toGeocode).slice(0, 5); // Process 5 at a time concurrently
            if (addresses.length === 0) return;

            // Run 5 requests in parallel to speed up processing
            await Promise.all(addresses.map(async (addr) => {
                if (geocodeCache.has(addr)) return;

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
                            setGeocodedLocations((prev) => new Map(prev).set(addr, { lat, lng }));
                        }
                    }
                } catch {
                    console.warn('Geocoding failed for', addr);
                }
            }));
        };

        // Only run if we have a lot of missing data
        if (toGeocode.size > 0) {
            setGeocodingQueueSize(toGeocode.size);
            const timer = setTimeout(processQueue, 500); // Faster cycle (0.5s)
            return () => clearTimeout(timer);
        } else {
            setGeocodingQueueSize(0);
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
                    machineType: loc.machineType,
                    hasIssue: loc.hasIssue // Pass to Mapbox
                },
                geometry: {
                    type: 'Point' as const,
                    coordinates: [loc.longitude!, loc.latitude!]
                }
            }))
        };
    }, [allLocations]);

    const { theme } = useTheme(); // Access theme
    const [isStyleLoaded, setIsStyleLoaded] = useState(false); // Track style loading

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = MAPBOX_CONFIG.token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAPBOX_CONFIG.styleDay, // Enforce Day Mode
            center: [MAPBOX_CONFIG.initialViewport.longitude, MAPBOX_CONFIG.initialViewport.latitude],
            zoom: 1.5, // Start grand (Globe View)
            maxBounds: undefined,
            projection: 'globe'
        });

        map.current.on('style.load', () => {
            // Add Fog (Day Mode)
            map.current?.setFog({
                color: 'rgb(255, 255, 255)', // Lower atmosphere
                'high-color': 'rgb(200, 215, 255)', // Upper atmosphere
                'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
                'space-color': 'rgb(11, 11, 25)', // Background color
                'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
            });

            // Add Pulsing Dot Image
            const size = 200;
            const pulsingDot = {
                width: size,
                height: size,
                data: new Uint8Array(size * size * 4),
                context: null as CanvasRenderingContext2D | null,

                onAdd: function () {
                    const canvas = document.createElement('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;
                    this.context = canvas.getContext('2d');
                },

                render: function () {
                    const duration = 1000;
                    const t = (performance.now() % duration) / duration;

                    const radius = (size / 2) * 0.3;
                    const outerRadius = (size / 2) * 0.7 * t + radius;
                    const context = this.context;

                    if (!context) return false;

                    // Draw outer circle
                    context.clearRect(0, 0, this.width, this.height);
                    context.beginPath();
                    context.arc(
                        this.width / 2,
                        this.height / 2,
                        outerRadius,
                        0,
                        Math.PI * 2
                    );
                    context.fillStyle = `rgba(66, 135, 245, ${1 - t})`;
                    context.fill();

                    // Draw inner circle
                    context.beginPath();
                    context.arc(
                        this.width / 2,
                        this.height / 2,
                        radius,
                        0,
                        Math.PI * 2
                    );
                    context.fillStyle = 'rgba(66, 135, 245, 1)';
                    context.strokeStyle = 'white';
                    context.lineWidth = 2 + 4 * (1 - t);
                    context.fill();
                    context.stroke();

                    // Update this image's data with data from the canvas
                    this.data = new Uint8Array(
                        context.getImageData(0, 0, this.width, this.height).data.buffer
                    );

                    // Return true to let the map know that the image was updated
                    map.current?.triggerRepaint();
                    return true;
                }
            };

            if (!map.current?.hasImage('pulsing-dot')) {
                map.current?.addImage('pulsing-dot', pulsingDot as never, { pixelRatio: 2 });
            }

            setIsStyleLoaded(true);
        });

        // Handle Theme Switch Logic separately to avoid re-init loop
        // ... (We'll add a separate effect for theme updates)

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true,
                showUserHeading: true
            }),
            'top-right'
        );

        map.current.on('load', () => {
            setIsMapLoaded(true);
        });

        // Cleanup
        return () => {
            map.current?.remove();
        };
    }, []);

    // Handle Style Updates (Theme Switch)
    // Handle Style Updates (Theme Switch)
    useEffect(() => {
        if (!map.current) return;

        const targetStyle = theme === 'dark' ? MAPBOX_CONFIG.styleNight : MAPBOX_CONFIG.styleDay;

        // Only update if different (mapboxgl handles basic diffing but setStyle is heavy)
        // We assume styles are different URLs.
        // Actually, we can just call setStyle, mapbox gl will handle diff if url is same, 
        // but if url changes, it reloads.

        map.current.setStyle(targetStyle);
        // Important: setStyle triggers 'style.load' again, so we need to re-add layers there.
        // We use `isStyleLoaded` state to trigger the layer effect below.

    }, [theme]);

    // Handle Source and Layers (Re-run when style loads or data changes)
    // Unified Layer Management
    const addAppLayers = useCallback(() => {
        if (!map.current) return;

        const sourceId = 'clients';

        // 1. Clients & Clusters Source
        const source = map.current.getSource(sourceId) as mapboxgl.GeoJSONSource;
        if (!source) {
            map.current.addSource(sourceId, {
                type: 'geojson',
                data: geoJsonData,
                cluster: true,
                clusterMaxZoom: MAPBOX_CONFIG.clusterMaxZoom,
                clusterRadius: MAPBOX_CONFIG.clusterRadius,
            });
        } else {
            source.setData(geoJsonData);
        }

        // 2. Leads Source
        const leadsSource = map.current.getSource('leads') as mapboxgl.GeoJSONSource;
        if (!leadsSource) {
            map.current.addSource('leads', {
                type: 'geojson',
                data: leadsGeoJson
            });
        } else {
            leadsSource.setData(leadsGeoJson);
        }

        // Only add layers if they don't exist
        if (!map.current.getLayer('clusters')) {

            // 3D Buildings
            if (!map.current.getLayer('3d-buildings')) {
                const buildingColor = theme === 'dark' ? '#243b55' : '#aaa';
                const buildingOpacity = theme === 'dark' ? 0.8 : 0.6;

                map.current.addLayer({
                    'id': '3d-buildings',
                    'source': 'composite',
                    'source-layer': 'building',
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'minzoom': 14,
                    'paint': {
                        'fill-extrusion-color': buildingColor,
                        'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.05, ['get', 'height']],
                        'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.05, ['get', 'min_height']],
                        'fill-extrusion-opacity': buildingOpacity
                    }
                });
            }

            // City Lights: Glowing Roads (Dark Mode Only)
            if (theme === 'dark' && !map.current.getLayer('road-glow')) {
                map.current.addLayer({
                    'id': 'road-glow',
                    'type': 'line',
                    'source': 'composite',
                    'source-layer': 'road',
                    'filter': [
                        'all',
                        ['==', '$type', 'LineString'],
                        ['in', 'class', 'motorway', 'trunk', 'primary']
                    ],
                    'layout': {
                        'line-cap': 'round',
                        'line-join': 'round'
                    },
                    'paint': {
                        'line-color': '#4dc2f8', // Cyberpunk Blue/Cyan
                        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 4],
                        'line-blur': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 3],
                        'line-opacity': 0.6
                    }
                }, '3d-buildings'); // Place below buildings
            }

            // Route Line
            if (!map.current.getSource('route')) {
                map.current.addSource('route', {
                    type: 'geojson',
                    data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
                });
            }
            if (!map.current.getLayer('route-line')) {
                map.current.addLayer({
                    id: 'route-line',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-opacity': 0.8 }
                });
            }

            // Clusters
            map.current.addLayer({
                id: 'clusters',
                type: 'circle',
                source: sourceId,
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
                    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
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

            // Unclustered Points
            map.current.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: sourceId,
                filter: ['all', ['!', ['has', 'point_count']], ['!=', ['get', 'index'], 0]], // Filter OUT main hubs
                paint: {
                    'circle-color': [
                        'case',
                        ['get', 'hasIssue'], '#ef4444', // RED for issues
                        ['==', ['get', 'type'], 'SubLocation'], '#818cf8',
                        ['match', ['get', 'membershipLevel'], 'Gold', MEMBERSHIP_COLORS.Gold, 'Silver', MEMBERSHIP_COLORS.Silver, 'Bronze', MEMBERSHIP_COLORS.Bronze, 'Platinum', MEMBERSHIP_COLORS.Platinum, MEMBERSHIP_COLORS.Expired]
                    ],
                    'circle-radius': ['case', ['==', ['get', 'type'], 'SubLocation'], 5, 8],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff'
                }
            });

            // PULSING HUB LAYER (Main locations only)
            if (!map.current.getLayer('pulsing-hub')) {
                map.current.addLayer({
                    id: 'pulsing-hub',
                    type: 'symbol',
                    source: sourceId,
                    filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'index'], 0]],
                    layout: {
                        'icon-image': 'pulsing-dot',
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true
                    }
                });
            }

            // Leads Heatmap
            if (!map.current.getLayer('leads-heat')) {
                map.current.addLayer({
                    id: 'leads-heat',
                    type: 'heatmap',
                    source: 'leads',
                    maxzoom: 15,
                    paint: {
                        // Increase the heatmap weight based on frequency and property magnitude
                        'heatmap-weight': [
                            'interpolate', ['linear'], ['get', 'rating'],
                            0, 0,
                            5, 1
                        ],
                        // Increase the heatmap color weight weight by zoom level
                        // heatmap-intensity is a multiplier on top of heatmap-weight
                        'heatmap-intensity': [
                            'interpolate', ['linear'], ['zoom'],
                            0, 1,
                            9, 3
                        ],
                        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                        // Begin color ramp at 0-stop with a 0-transparancy color
                        // to create a blur-like effect.
                        'heatmap-color': [
                            'interpolate', ['linear'], ['heatmap-density'],
                            0, 'rgba(33,102,172,0)',
                            0.2, 'rgb(103,169,207)',
                            0.4, 'rgb(209,229,240)',
                            0.6, 'rgb(253,219,199)',
                            0.8, 'rgb(239,138,98)',
                            1, 'rgb(178,24,43)'
                        ],
                        // Adjust the heatmap radius by zoom level
                        'heatmap-radius': [
                            'interpolate', ['linear'], ['zoom'],
                            0, 2,
                            9, 20
                        ],
                        // Transition from heatmap to circle layer by zoom level
                        'heatmap-opacity': [
                            'interpolate', ['linear'], ['zoom'],
                            14, 1,
                            15, 0
                        ]
                    }
                }, 'waterway-label'); // Place before labels
            }

            // Leads Layer (Points)
            if (!map.current.getLayer('leads-point')) {
                map.current.addLayer({
                    id: 'leads-point',
                    type: 'circle',
                    source: 'leads',
                    minzoom: 14, // Only show points when close
                    paint: {
                        'circle-color': '#f59e0b',
                        'circle-radius': 6,
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#fff',
                        'circle-opacity': 0.8
                    }
                });
            }

            // Draw Control check
            if (!draw.current && map.current) {
                draw.current = new MapboxDraw({
                    displayControlsDefault: false,
                    controls: { polygon: true, trash: true },
                    defaultMode: 'simple_select'
                });
                map.current.addControl(draw.current, 'top-right');
                map.current.on('draw.create', () => setHasShape(true));
                map.current.on('draw.delete', () => setHasShape(false));
                map.current.on('draw.update', () => setHasShape(true));
            }

            // Re-bind Event Handlers
            // Cluster Click
            map.current.on('click', 'clusters', (e) => {
                const features = map.current?.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                const feature = features?.[0];
                const clusterId = feature?.properties?.cluster_id;
                if (!feature || !clusterId) return;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const center = (feature.geometry as any).coordinates;

                (map.current?.getSource(sourceId) as mapboxgl.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
                    if (err || !zoom) return;
                    // Cinematic Cluster Zoom
                    map.current?.flyTo({
                        center,
                        zoom,
                        speed: 1.2,
                        curve: 1.1,
                        pitch: 45, // Mild tilt
                        bearing: 0,
                        essential: true
                    });
                });
            });

            // Point Click
            map.current.on('click', 'unclustered-point', (e) => {
                const feature = e.features?.[0];
                const clientId = feature?.properties?.clientId;

                // Cinematic Point Selection
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const coordinates = (feature?.geometry as any).coordinates;

                // Fly to the point with a "Drone View"
                map.current?.flyTo({
                    center: coordinates,
                    zoom: 17,
                    pitch: 60,
                    bearing: -20, // Slight angle for depth
                    speed: 1.5,
                    curve: 1,
                    essential: true
                });

                if (e.originalEvent.shiftKey || e.originalEvent.metaKey) {
                    const loc = latestRef.current.allLocations.find(l => l.clientId === clientId && l.type === 'Main');
                    if (loc) latestRef.current.handleAddToRoute(loc);
                    return;
                }

                if (clientId) {
                    const client = clients.find(c => c.id === clientId);
                    if (client) latestRef.current.onClientSelect(client);
                }
            });

            // Leads Click
            map.current.on('click', 'leads-point', (e) => {
                const feature = e.features?.[0];
                if (!feature) return;

                const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const props = feature.properties as any;

                new mapboxgl.Popup()
                    .setLngLat(coords)
                    .setHTML(`
                        <div class="p-2">
                            <h3 class="font-bold text-sm">${props.name}</h3>
                            <p class="text-xs text-gray-500 capitalize">${props.businessType}</p>
                            <p class="text-xs mt-1">${props.address}</p>
                            <button class="mt-2 w-full bg-blue-600 text-white text-xs px-2 py-1 rounded" onclick="window.dispatchEvent(new CustomEvent('addToCRM', { detail: '${props.id}' }))">Add to CRM</button>
                        </div>
                    `)
                    .addTo(map.current!);
            });

            // Cursors
            const setPointer = () => { if (map.current) map.current.getCanvas().style.cursor = 'pointer'; };
            const setUnset = () => { if (map.current) map.current.getCanvas().style.cursor = ''; };

            map.current.on('mouseenter', 'clusters', setPointer);
            map.current.on('mouseleave', 'clusters', setUnset);
            map.current.on('mouseenter', 'unclustered-point', setPointer);
            map.current.on('mouseleave', 'unclustered-point', setUnset);
            map.current.on('mouseenter', 'leads-point', setPointer);
            map.current.on('mouseleave', 'leads-point', setUnset);
        }
    }, [geoJsonData, leadsGeoJson, clients, theme]);

    // Intro Fly-In Effect
    useEffect(() => {
        if (!isMapLoaded || !map.current || clients.length === 0) return;

        // Calculate bounds of all clients
        const bounds = new mapboxgl.LngLatBounds();
        clients.forEach(c => {
            if (c.longitude && c.latitude) {
                bounds.extend([c.longitude, c.latitude]);
            }
        });

        // 1. Initial State is Globe (Zoom 1.5) set in init
        // 2. Wait a moment, then fly to bounds
        const timer = setTimeout(() => {
            map.current?.flyTo({
                center: bounds.getCenter(),
                zoom: 4, // Start with a country-level view
                speed: 0.5, // Slow fly
                curve: 1.2,
                essential: true,
                padding: { top: 100, bottom: 100, left: 100, right: 100 }
            });

            // 3. Then zoom in further to data
            setTimeout(() => {
                map.current?.fitBounds(bounds, {
                    padding: { top: 100, bottom: 100, left: 350, right: 100 }, // Account for sidebar
                    maxZoom: 12,
                    duration: 2500,
                    essential: true
                });
            }, 3000);

        }, 1500);

        return () => clearTimeout(timer);
    }, [isMapLoaded, clients]);

    // Apply Layers when style is loaded
    useEffect(() => {
        if (!map.current || !isStyleLoaded) return;
        addAppLayers();
    }, [isStyleLoaded, addAppLayers]);

    // Force update data if GeoJSON changes 
    useEffect(() => {
        if (!map.current || !map.current.getSource('clients')) return;
        (map.current.getSource('clients') as mapboxgl.GeoJSONSource).setData(geoJsonData);
    }, [geoJsonData]);

    useEffect(() => {
        if (!map.current || !map.current.getSource('leads')) return;
        (map.current.getSource('leads') as mapboxgl.GeoJSONSource).setData(leadsGeoJson);
    }, [leadsGeoJson]);

    // --- Routing Handlers ---
    const handleAddToRoute = (location: ExtendedLocation) => {
        if (routeStops.find(l => l.id === location.id)) return; // No duplicates
        setRouteStops(prev => [...prev, location]);
        setIsOptimized(false);
        setRouteStats(undefined);
    };

    const handleRemoveStop = (id: string) => {
        setRouteStops(prev => prev.filter(s => s.id !== id));
        setIsOptimized(false);
        setRouteStats(undefined);
    };

    const [routeStats, setRouteStats] = useState<{ distance: string; duration: string } | undefined>(undefined);

    const handleOptimize = useCallback(async () => {
        if (routeStops.length < 2) return;

        // 1. Optimize Order (TSP Lite)
        const optimized = optimizeRoute(routeStops[0]!, routeStops);
        setRouteStops(optimized);
        setIsOptimized(true);

        // 2. Fetch Real Driving Route from Mapbox Directions API
        try {
            // Mapbox Directions API supports up to 25 coordinates per request. 
            // For MVP we assume < 25 stops.
            const coordinates = optimized.map(l => `${l.longitude},${l.latitude}`).join(';');
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=${MAPBOX_CONFIG.token}`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const geojson = {
                    type: 'Feature' as const,
                    properties: {},
                    geometry: route.geometry
                };

                // Update Map Layer
                if (map.current?.getSource('route')) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (map.current.getSource('route') as any).setData(geojson);
                }

                // Update Stats
                const distanceMiles = (route.distance / 1609.34).toFixed(1);
                const durationMins = Math.round(route.duration / 60);

                // Format duration nicely
                let durationStr = `${durationMins} min`;
                if (durationMins > 60) {
                    const hours = Math.floor(durationMins / 60);
                    const mins = durationMins % 60;
                    durationStr = `${hours}h ${mins}m`;
                }

                setRouteStats({
                    distance: `${distanceMiles} mi`,
                    duration: durationStr
                });
            }
        } catch (error) {
            console.error('Failed to fetch optimized route:', error);
            // Fallback to straight lines if API fails
            const coordinates = optimized.map(l => [l.longitude, l.latitude]);
            const geojson = {
                type: 'Feature' as const,
                properties: {},
                geometry: {
                    type: 'LineString' as const,
                    coordinates: coordinates as number[][]
                }
            };
            if (map.current?.getSource('route')) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (map.current.getSource('route') as any).setData(geojson);
            }
        }
    }, [routeStops]);

    const handleClearRoute = () => {
        setRouteStops([]);
        setIsOptimized(false);
        setRouteStats(undefined);
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
        // const data = draw.current?.getAll();
        // In a real app, send to API
        setIsDrawing(false);
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
                onRemoveStop={handleRemoveStop}
                onClear={handleClearRoute}
                isOptimized={isOptimized}
                routeStats={routeStats}
            />
            {/* Loading Indicator for Geocoding */}
            {clients.length > allLocations.length && (
                <div className="absolute bottom-6 right-6 z-50 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs shadow-md">
                    Mapping {allLocations.length} / {clients.length * 2} locations...
                </div>
            )}
            {/* Geocoding Progress Indicator */}
            {geocodingQueueSize > 0 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md flex items-center gap-2 border border-blue-100">
                    <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-blue-700">
                        {geocodingQueueSize > 1 ? `Mapping ${geocodingQueueSize} locations...` : 'Finishing up...'}
                    </span>
                </div>
            )}
        </div>
    );
}
