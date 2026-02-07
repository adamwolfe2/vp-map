'use server';

import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type Stop = {
    id: string;
    address: string;
    lat: number;
    lng: number;
    order: number;
};

export async function saveRoute(name: string, stops: Stop[]) {
    const session = await auth();
    const userId = session.userId;

    if (!userId) throw new Error('Unauthorized');

    // Verify user exists in our DB (sync if needed)
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
        // Lazy create
        const { currentUser } = await import('@clerk/nextjs/server');
        const clerkUser = await currentUser();
        if (!clerkUser) throw new Error('User not found');

        user = await prisma.user.create({
            data: {
                clerkId: userId,
                email: clerkUser.emailAddresses[0]?.emailAddress || 'no-email@example.com',
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User',
                role: 'OPERATOR'
            }
        });
    }

    // Create the route
    const route = await prisma.savedRoute.create({
        data: {
            userId: user.id,
            name,
            stops: JSON.stringify(stops)
        }
    });

    return { success: true, routeId: route.id };
}

export async function getRoutes() {
    const session = await auth();
    const userId = session.userId;

    if (!userId) return [];

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return [];

    const routes = await prisma.savedRoute.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return routes.map((r: any) => ({
        ...r,
        stops: JSON.parse(r.stops as string) as Stop[]
    }));
}
