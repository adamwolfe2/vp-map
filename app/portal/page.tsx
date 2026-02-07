
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

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

                <Link href="/portal/my-route" className="block">
                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm hover:border-primary transition-colors cursor-pointer h-full">
                        <h3 className="font-semibold text-lg mb-2">My Route</h3>
                        <p className="text-muted-foreground text-sm">Plan and optimize your daily path.</p>
                    </div>
                </Link>

                <Link href="/portal/inventory" className="block">
                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm hover:border-primary transition-colors cursor-pointer h-full">
                        <h3 className="font-semibold text-lg mb-2">Inventory</h3>
                        <p className="text-muted-foreground text-sm">Manage products and machine planograms.</p>
                    </div>
                </Link>

                <Link href="/portal/finance" className="block">
                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm hover:border-primary transition-colors cursor-pointer h-full">
                        <h3 className="font-semibold text-lg mb-2">Financials</h3>
                        <p className="text-muted-foreground text-sm">Track revenue, expenses, and net profit.</p>
                    </div>
                </Link>

                <Link href="/portal/leads" className="block">
                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm hover:border-primary transition-colors cursor-pointer h-full">
                        <h3 className="font-semibold text-lg mb-2">My Leads</h3>
                        <p className="text-muted-foreground text-sm">View location assignments from HQ.</p>
                    </div>
                </Link>

                <Link href="/portal/leaderboard" className="block">
                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm hover:border-primary transition-colors cursor-pointer h-full">
                        <h3 className="font-semibold text-lg mb-2">Leaderboard</h3>
                        <p className="text-muted-foreground text-sm">See top performing operators.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
