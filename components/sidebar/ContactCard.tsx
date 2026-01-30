import { Mail, Phone, MapPin, Building } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { VendingpreneurClient } from '@/lib/types';
import { formatPhoneNumber } from '@/lib/utils';

interface ContactCardProps {
    client: VendingpreneurClient;
}

export default function ContactCard({ client }: ContactCardProps) {
    return (
        <Card className="p-4 space-y-3">
            {client.personalEmail && (
                <a
                    href={`mailto:${client.personalEmail}`}
                    className="flex items-center gap-2 text-sm hover:text-primary"
                >
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{client.personalEmail}</span>
                </a>
            )}

            {client.phoneNumber && (
                <a
                    href={`tel:${client.phoneNumber}`}
                    className="flex items-center gap-2 text-sm hover:text-primary"
                >
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{formatPhoneNumber(client.phoneNumber)}</span>
                </a>
            )}

            {client.businessName && (
                <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{client.businessName}</span>
                </div>
            )}

            {client.fullAddress && (
                <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">{client.fullAddress}</span>
                </div>
            )}
        </Card>
    );
}
