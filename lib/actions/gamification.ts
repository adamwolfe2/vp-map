'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getLeaderboard() {
    // Top 10 users who are public, sorted by points
    const leaders = await prisma.user.findMany({
        where: { isPublic: true },
        orderBy: { points: 'desc' },
        take: 10,
        select: {
            id: true,
            name: true,
            points: true,
            createdAt: true
        }
    });

    return leaders;
}

export async function getMyGamificationStatus() {
    const session = await auth();
    if (!session.userId) return null;

    return await prisma.user.findUnique({
        where: { clerkId: session.userId },
        select: { points: true, isPublic: true }
    });
}

export async function togglePrivacy(isPublic: boolean) {
    const session = await auth();
    if (!session.userId) throw new Error('Unauthorized');

    await prisma.user.update({
        where: { clerkId: session.userId },
        data: { isPublic }
    });

    revalidatePath('/portal/leaderboard');
    return { success: true };
}
