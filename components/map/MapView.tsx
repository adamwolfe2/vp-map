'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { VendingpreneurClient } from '@/lib/types';
import { MAPBOX_CONFIG, MEMBERSHIP_COLORS } from '@/lib/constants';

interface MapViewProps {
    clients: VendingpreneurClient[];
    onClientSelect: (client: VendingpreneurClient) => void;
}

export default function MapView({ clients, onClientSelect }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Convert clients to GeoJSON
    const geoJsonData = useMemo((): GeoJSON.FeatureCollection => {
        return {
            type: 'FeatureCollection',
            features: clients
                .filter(c => c.latitude && c.longitude)
                .map(client => ({
                    type: 'Feature',
                    properties: {
                        id: client.id,
                        membershipLevel: client.membershipLevel || 'Expired',
                        // Store minimal needed data for rendering/clustering
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [client.longitude!, client.latitude!]
                    }
                }))
        };
    }, [clients]);

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
                    'circle-color': [
                        'match',
                        ['get', 'membershipLevel'],
                        'Gold', MEMBERSHIP_COLORS.Gold,
                        'Silver', MEMBERSHIP_COLORS.Silver,
                        'Bronze', MEMBERSHIP_COLORS.Bronze,
                        'Platinum', MEMBERSHIP_COLORS.Platinum,
                        MEMBERSHIP_COLORS.Expired // default
                    ],
                    'circle-radius': 8,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff'
                }
            });

            // Event Handlers

            // Click on cluster -> Zoom in
            // Click on cluster -> Zoom in
            map.current.on('click', 'clusters', (e) => {
                const features = map.current?.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                const clusterId = features && features[0] && features[0].properties ? features[0].properties.cluster_id : null;

                if (!clusterId || !features || !features[0]) return;

                const center = (features[0].geometry as any).coordinates;

                (map.current?.getSource(sourceId) as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
                    clusterId,
                    (err, zoom) => {
                        if (err || !map.current || zoom === null || zoom === undefined) return;
                        map.current.easeTo({
                            center,
                            zoom: zoom
                        });
                    }
                );
            });

            // Click on individual point -> Select client
            map.current.on('click', 'unclustered-point', (e) => {
                const feature = e.features?.[0];
                const clientId = feature?.properties?.id;

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
        </div>
    );
}
