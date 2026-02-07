'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';


// Admin only: Update price for all products with matching UPC across the entire network
export async function pushGlobalPriceUpdate(upc: string, newPrice: number) {
    const session = await auth();
    const userId = session.userId;
    if (!userId) throw new Error('Unauthorized');

    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== 'ADMIN') throw new Error('Must be HQ to push updates');

    // Update all products with this UPC
    const result = await prisma.product.updateMany({
        where: { upc: upc },
        data: { price: newPrice }
    });

    // Also update all slots containing this product? 
    // This is trickier because Slot doesn't link to Product via UPC directly, but via Product ID.
    // If we update the Product record, the Slot record (which copies price?) might need update.
    // In our schema, Slot has `price` float default 1.50. 
    // Ideally, we'd update slots too.

    // Find all products with this UPC
    const products = await prisma.product.findMany({
        where: { upc: upc },
        select: { id: true }
    });

    const productIds = products.map((p: { id: string }) => p.id);

    // Update slots with these products
    const slotsResult = await prisma.slot.updateMany({
        where: { productId: { in: productIds } },
        data: { price: newPrice }
    });

    return {
        productsUpdated: result.count,
        slotsUpdated: slotsResult.count
    };
}

export async function broadcastAnnouncement(message: string) {
    // Placeholder for a notification system
    // Could create a "Notification" record for all users
    console.log(`Broadcasting: ${message}`);
    return { success: true };
}
