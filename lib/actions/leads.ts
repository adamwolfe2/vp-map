'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// Get leads owned by specific user (Admin context usually)
export async function getAdminLeads() {
    const session = await auth();
    const userId = session.userId;
    if (!userId) return [];

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== 'ADMIN') return []; // Strict admin check

    return await prisma.lead.findMany({
        where: {
            ownerId: user.id,
            status: 'NEW' // Only unassigned/new leads in the pool
        },
        orderBy: { createdAt: 'desc' }
    });
}

// Get list of operators to assign to
export async function getOperators() {
    // In a real app, maybe filter by vicinity or rating. 
    // Here we just return all operators.
    return await prisma.user.findMany({
        where: { role: 'OPERATOR' },
        select: { id: true, name: true, email: true }
    });
}

// Transfer lead from Admin to Operator
export async function assignLead(leadId: string, targetOperatorId: string, notes?: string) {
    const session = await auth();
    const userId = session.userId;
    if (!userId) throw new Error('Unauthorized');

    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== 'ADMIN') throw new Error('Must be admin to assign leads');

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead not found');

    // Perform the transfer
    return await prisma.lead.update({
        where: { id: leadId },
        data: {
            ownerId: targetOperatorId, // New Owner
            originalFinderId: admin.id, // Track who gave it
            assignedAt: new Date(),
            adminNotes: notes,
            status: 'NEW' // Reset status for the new owner so it shows as "New" to them? Or keep state? 'NEW' for them is correct.
        }
    });
}

// Get leads assigned to the logged-in operator
export async function getMyLeads() {
    const session = await auth();
    const userId = session.userId;
    if (!userId) return [];

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return [];

    return await prisma.lead.findMany({
        where: { ownerId: user.id },
        orderBy: { assignedAt: 'desc' } // Recently assigned first
    });
}
