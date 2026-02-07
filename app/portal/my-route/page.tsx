
import RoutePlanner from '@/components/portal/RoutePlanner';

export default function MyRoutePage() {
    return (
        <div className="container mx-auto p-4 md:p-8 h-screen flex flex-col">
            <h1 className="text-2xl font-bold mb-4 flex-shrink-0">My Logistics</h1>
            <RoutePlanner />
        </div>
    );
}
