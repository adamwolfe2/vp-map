
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function OperatorPortal() {
    const user = await currentUser();

    if (!user) return <div>Access Denied</div>;

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4">Welcome, {user.firstName || 'Vendingpreneur'}</h1>
            <p className="mb-8 text-muted-foreground">This is your private workspace.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <h3 className="font-semibold text-lg mb-2">My Credits</h3>
                    <p className="text-2xl font-bold">0</p>
                    <span className="text-xs text-muted-foreground">Tokens available for scraping</span>
                </div>

                <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <h3 className="font-semibold text-lg mb-2">My Leads</h3>
                    <p className="text-2xl font-bold">0</p>
                    <span className="text-xs text-muted-foreground">Potential locations found</span>
                </div>

                <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <h3 className="font-semibold text-lg mb-2">My Route</h3>
                    <p className="text-muted-foreground text-sm">No active route.</p>
                </div>
            </div>
        </div>
    );
}
