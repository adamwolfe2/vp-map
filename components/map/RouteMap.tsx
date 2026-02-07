'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_CONFIG } from '@/lib/constants';
import { useTheme } from '@/contexts/ThemeContext';

interface Stop {
    id: string;
    address: string;
    lat: number;
    lng: number;
    order: number;
}

interface RouteMapProps {
    stops: Stop[];
}

export default function RouteMap({ stops }: RouteMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!mapContainer.current) return;

        mapboxgl.accessToken = MAPBOX_CONFIG.token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: theme === 'dark' ? MAPBOX_CONFIG.styleNight : MAPBOX_CONFIG.styleDay,
            center: [-98.5795, 39.8283], // Center of US
            zoom: 3,
            projection: 'globe'
        });

        map.current.on('style.load', () => {
            // Fog for aesthetics
            map.current?.setFog({
                color: 'rgb(186, 210, 235)',
                'high-color': 'rgb(36, 92, 223)',
                'horizon-blend': 0.02,
                'space-color': 'rgb(11, 11, 25)',
                'star-intensity': 0.6
            });
        });

        return () => {
            map.current?.remove();
        };
    }, [theme]);

    // Update theme
    useEffect(() => {
        if (map.current) {
            map.current.setStyle(theme === 'dark' ? MAPBOX_CONFIG.styleNight : MAPBOX_CONFIG.styleDay);
        }
    }, [theme]);

    // Update pins and route line
    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return;

        const updateLayers = () => {
            if (!map.current) return;

            // Source Data
            const geoJson: GeoJSON.FeatureCollection = {
                type: 'FeatureCollection',
                features: stops.map((stop, i) => ({
                    type: 'Feature',
                    properties: { order: i + 1, address: stop.address },
                    geometry: {
                        type: 'Point',
                        coordinates: [stop.lng, stop.lat]
                    }
                }))
            };

            const lineGeoJson: GeoJSON.Feature = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: stops.map(s => [s.lng, s.lat])
                }
            };

            // Add/Update Route Source
            const routeSource = map.current.getSource('route-path') as mapboxgl.GeoJSONSource;
            if (!routeSource) {
                map.current.addSource('route-path', { type: 'geojson', data: lineGeoJson });
                map.current.addLayer({
                    id: 'route-line',
                    type: 'line',
                    source: 'route-path',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-opacity': 0.8 }
                });
            } else {
                routeSource.setData(lineGeoJson);
            }

            // Add/Update Stops Source
            const stopsSource = map.current.getSource('stops') as mapboxgl.GeoJSONSource;
            if (!stopsSource) {
                map.current.addSource('stops', { type: 'geojson', data: geoJson });

                // Circle for stop
                map.current.addLayer({
                    id: 'stop-points',
                    type: 'circle',
                    source: 'stops',
                    paint: {
                        'circle-color': '#f59e0b',
                        'circle-radius': 8,
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#fff'
                    }
                });

                // Number for order
                map.current.addLayer({
                    id: 'stop-labels',
                    type: 'symbol',
                    source: 'stops',
                    layout: {
                        'text-field': '{order}',
                        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                        'text-size': 12,
                        'text-offset': [0, -1.5] // Float above point
                    },
                    paint: {
                        'text-color': '#fff'
                    }
                });
            } else {
                stopsSource.setData(geoJson);
            }

            // Fit Bounds
            if (stops.length > 0) {
                const bounds = new mapboxgl.LngLatBounds();
                stops.forEach(s => bounds.extend([s.lng, s.lat]));
                map.current.fitBounds(bounds, { padding: 50 });
            }
        };

        if (map.current.isStyleLoaded()) {
            updateLayers();
        } else {
            map.current.once('style.load', updateLayers);
        }

    }, [stops, theme]); // Re-run when stops change

    return <div ref={mapContainer} className="w-full h-full rounded-lg" />;
}
