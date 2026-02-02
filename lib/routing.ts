import { distance } from '@turf/turf';
import { ExtendedLocation } from './types';

// Simple Nearest Neighbor Algorithm implementation
// This isn't perfect TSP, but good enough for < 20 locs
export function optimizeRoute(
    startLocation: ExtendedLocation,
    stops: ExtendedLocation[]
): ExtendedLocation[] {
    const unvisited = [...stops];
    const route: ExtendedLocation[] = [startLocation];
    let currentLocation = startLocation;

    // Remove start location from unvisited if it's in there
    const startIndex = unvisited.findIndex(l => l.id === startLocation.id);
    if (startIndex > -1) {
        unvisited.splice(startIndex, 1);
    }

    while (unvisited.length > 0) {
        let nearestIndex = -1;
        let minDistance = Infinity;

        // Find nearest unvisited neighbor
        for (let i = 0; i < unvisited.length; i++) {
            const candidate = unvisited[i]!;

            // Turf distance: [lng, lat]
            const d = distance(
                [currentLocation.longitude!, currentLocation.latitude!],
                [candidate.longitude!, candidate.latitude!]
            );

            if (d < minDistance) {
                minDistance = d;
                nearestIndex = i;
            }
        }

        if (nearestIndex > -1) {
            const nextLocation = unvisited[nearestIndex]!;
            route.push(nextLocation);
            currentLocation = nextLocation;
            unvisited.splice(nearestIndex, 1);
        } else {
            // Should not happen if unvisited > 0
            break;
        }
    }

    return route;
}
