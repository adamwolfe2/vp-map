'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Save } from 'lucide-react';
import RouteMap from '@/components/map/RouteMap';
import { saveRoute, Stop } from '@/lib/actions/route';
import { toast } from 'sonner';

// Helper to manually geocode (since we don't have a backend geocoder yet exposed to this component safely)
// We will use the client-side Mapbox Geocoding API directly here for simplicity in Phase 1
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function RoutePlanner() {
    const [addressInput, setAddressInput] = useState('');
    const [stops, setStops] = useState<Stop[]>([]);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [routeName, setRouteName] = useState('My Daily Route');

    const handleAddStop = async () => {
        if (!addressInput) return;
        setIsGeocoding(true);

        try {
            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressInput)}.json?access_token=${MAPBOX_TOKEN}&limit=1`);
            const data = await res.json();

            if (data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].center;
                const newStop: Stop = {
                    id: crypto.randomUUID(),
                    address: data.features[0].place_name,
                    lat,
                    lng,
                    order: stops.length + 1
                };
                setStops([...stops, newStop]);
                setAddressInput('');
            } else {
                toast.error('Address not found');
            }
        } catch {
            toast.error('Failed to geocode address');
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleSave = async () => {
        try {
            await saveRoute(routeName, stops);
            toast.success('Route saved!');
        } catch {
            toast.error('Failed to save route');
        }
    };

    const removeStop = (id: string) => {
        setStops(stops.filter(s => s.id !== id));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 flex flex-col gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Plan Your Route</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Route Name</Label>
                            <Input value={routeName} onChange={e => setRouteName(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter address..."
                                value={addressInput}
                                onChange={e => setAddressInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddStop()}
                            />
                            <Button onClick={handleAddStop} disabled={isGeocoding}>
                                {isGeocoding ? '...' : 'Add'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex-1 overflow-hidden flex flex-col">
                    <CardHeader>
                        <CardTitle>Stops ({stops.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="p-4 space-y-2">
                                {stops.map((stop, i) => (
                                    <div key={stop.id} className="flex items-center justify-between p-2 border rounded bg-card/50 hover:bg-muted/50">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-bold">
                                                {i + 1}
                                            </span>
                                            <span className="text-sm truncate" title={stop.address}>{stop.address}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeStop(stop.id)}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                ))}
                                {stops.length === 0 && (
                                    <div className="text-center text-muted-foreground text-sm py-8">
                                        No stops added yet.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <div className="p-4 border-t">
                        <Button className="w-full gap-2" onClick={handleSave} disabled={stops.length === 0}>
                            <Save size={16} /> Save Route
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Map View */}
            <div className="lg:col-span-2 bg-muted/20 rounded-lg border overflow-hidden relative">
                <RouteMap stops={stops} />
            </div>
        </div>
    );
}
