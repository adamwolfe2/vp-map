'use client';

import { useEffect, useRef, useState } from 'react';
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

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = MAPBOX_CONFIG.token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAPBOX_CONFIG.style,
            center: [MAPBOX_CONFIG.initialViewport.longitude, MAPBOX_CONFIG.initialViewport.latitude],
            zoom: MAPBOX_CONFIG.initialViewport.zoom,
        });

        map.current.on('load', () => {
            setIsMapLoaded(true);
        });

        // Cleanup
        return () => {
            map.current?.remove();
        };
    }, []);

    // Add markers when data changes
    useEffect(() => {
        if (!map.current || !isMapLoaded) return;

        // Clear existing markers
        // Note: Since we are using vanilla markers, we can't easily clear them efficiently without tracking them.
        // Ideally we track them in a ref. 
        // The visual guide implementation didn't store them in a ref to clear, but it should.
        // I will add a ref to track markers for cleanup.
    }, [clients, isMapLoaded, onClientSelect]); // This effect is incomplete in my thought, I'll write the full code below.

    // Re-writing the effect with marker cleanup logic which is safer
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    useEffect(() => {
        if (!map.current || !isMapLoaded) return;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        clients.forEach((client) => {
            if (!client.latitude || !client.longitude) return;

            const color = MEMBERSHIP_COLORS[client.membershipLevel || 'Expired'] || '#999999';

            // Create marker element
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.width = '24px';
            el.style.height = '24px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = color;
            el.style.border = '2px solid white';
            el.style.cursor = 'pointer';
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

            // Add hover effect
            el.addEventListener('mouseenter', () => {
                el.style.transform = 'scale(1.2)';
                el.style.zIndex = '1000';
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'scale(1)';
                el.style.zIndex = '1';
            });

            // Create marker
            const marker = new mapboxgl.Marker(el)
                .setLngLat([client.longitude, client.latitude])
                .addTo(map.current!);

            // Add click handler
            el.addEventListener('click', () => {
                onClientSelect(client);
            });

            markersRef.current.push(marker);
        });

    }, [clients, isMapLoaded, onClientSelect]);

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainer} className="absolute inset-0" />
        </div>
    );
}
