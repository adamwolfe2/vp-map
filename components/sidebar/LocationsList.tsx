import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { VendingpreneurClient, ClientLocation } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

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
                                <p className="text-gray-600">{location.address}</p>
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
