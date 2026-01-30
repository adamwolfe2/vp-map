import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { VendingpreneurClient, ClientLocation } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { MapPin } from 'lucide-react';

interface LocationsListProps {
    client: VendingpreneurClient;
}

export default function LocationsList({ client }: LocationsListProps) {
    const locations: ClientLocation[] = [];

    // Collect all locations (1-5)
    for (let i = 1; i <= 5; i++) {
        const address = client[`location${i}Address` as keyof VendingpreneurClient] as string | undefined;
        if (address) {
            locations.push({
                address,
                machineType: client[`location${i}MachineType` as keyof VendingpreneurClient] as string | undefined,
                monthlyRevenue: client[`location${i}MonthlyRevenue` as keyof VendingpreneurClient] as number | undefined,
                numberOfMachines: client[`location${i}NumberOfMachines` as keyof VendingpreneurClient] as number | undefined,
                propertyType: client[`location${i}PropertyType` as keyof VendingpreneurClient] as string | undefined,
            });
        }
    }

    if (locations.length === 0) {
        return null;
    }

    const openGoogleMaps = (address: string) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    };

    return (
        <Card className="p-4">
            <h3 className="font-semibold mb-3">Locations ({locations.length})</h3>
            <Accordion type="single" collapsible className="w-full">
                {locations.map((location, index) => (
                    <AccordionItem key={index} value={`location-${index}`}>
                        <AccordionTrigger className="text-sm">
                            Location {index + 1}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 text-sm">
                                <div
                                    className="flex items-start gap-2 text-gray-600 hover:text-primary cursor-pointer border-b pb-2 mb-2"
                                    onClick={() => openGoogleMaps(location.address)}
                                >
                                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                    <p>{location.address}</p>
                                </div>
                                {location.machineType && (
                                    <p><span className="font-medium">Machine:</span> {location.machineType}</p>
                                )}
                                {location.numberOfMachines && (
                                    <p><span className="font-medium">Count:</span> {location.numberOfMachines}</p>
                                )}
                                {location.monthlyRevenue && (
                                    <p><span className="font-medium">Revenue:</span> {formatCurrency(location.monthlyRevenue)}</p>
                                )}
                                {location.propertyType && (
                                    <p><span className="font-medium">Type:</span> {location.propertyType}</p>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </Card>
    );
}
