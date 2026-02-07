'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// --- Products ---

export async function createProduct(data: { name: string; brand?: string; upc?: string; cost?: number; price?: number }) {
    const session = await auth();
    const userId = session.userId;
    if (!userId) throw new Error('Unauthorized');

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) throw new Error('User not found');

    return await prisma.product.create({
        data: {
            ...data,
            userId: user.id
        }
    });
}

export async function getProducts() {
    const session = await auth();
    const userId = session.userId;
    if (!userId) return []; // Should handle public/global products differently later

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return [];

    return await prisma.product.findMany({
        where: {
            OR: [
                { userId: user.id },
                { userId: null } // Global products
            ]
        },
        orderBy: { name: 'asc' }
    });
}

// --- Machines & Planograms ---

export async function createMachine(name: string, type: string) {
    const session = await auth();
    const userId = session.userId;
    if (!userId) throw new Error('Unauthorized');

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) throw new Error('User not found');

    const machine = await prisma.machine.create({
        data: {
            userId: user.id,
            name,
            type,
            planogram: {
                create: {} // Init empty planogram
            }
        }
    });

    return machine;
}

export async function getMachines() {
    const session = await auth();
    const userId = session.userId;
    if (!userId) return [];

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return [];

    return await prisma.machine.findMany({
        where: { userId: user.id },
        include: { planogram: { include: { slots: { include: { product: true } } } } }
    });
}

export async function updateSlot(planogramId: string, position: string, productId: string | null, capacity: number, price: number) {
    // Upsert the slot
    return await prisma.slot.upsert({
        where: {
            planogramId_position: {
                planogramId,
                position
            }
        },
        update: {
            productId,
            capacity,
            price
        },
        create: {
            planogramId,
            position,
            productId,
            capacity,
            price
        }
    });
}

export async function getMachineWithPlanogram(machineId: string) {
    const session = await auth();
    const userId = session.userId;
    if (!userId) return null;

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return null;

    return await prisma.machine.findFirst({
        where: {
            id: machineId,
            userId: user.id
        },
        include: {
            planogram: {
                include: {
                    slots: {
                        include: { product: true }
                    }
                }
            }
        }
    });
}
