'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function logExpense(data: { category: string; amount: number; description?: string; date?: Date }) {
    const session = await auth();
    const userId = session.userId;
    if (!userId) throw new Error('Unauthorized');

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) throw new Error('User not found');

    return await prisma.expense.create({
        data: {
            userId: user.id,
            category: data.category,
            amount: data.amount,
            description: data.description,
            date: data.date || new Date()
        }
    });
}

export async function getExpenses() {
    const session = await auth();
    const userId = session.userId;
    if (!userId) return [];

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return [];

    return await prisma.expense.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' }
    });
}

export async function getFinancialSummary() {
    const session = await auth();
    const userId = session.userId;
    if (!userId) return null;

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return null;

    // Fetch Expenses
    const expenses = await prisma.expense.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' }
    });

    // Fetch Revenue (from RestockLogs for now, ideally strictly transactions later)
    // We assume 'totalRevenue' in RestockLog is actual cash collected
    const restocks = await prisma.restockLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    });

    // Calculate Totals per Month (last 6 months)
    const monthlyData = new Map<string, { month: string, revenue: number, expense: number, profit: number }>();

    // Helper to get Year-Month key
    const getKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const getLabel = (d: Date) => d.toLocaleString('default', { month: 'short', year: 'numeric' });

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = getKey(d);
        monthlyData.set(key, { month: getLabel(d), revenue: 0, expense: 0, profit: 0 });
    }

    // Aggregate Expenses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expenses.forEach((e: any) => {
        const key = getKey(e.date);
        if (monthlyData.has(key)) {
            const entry = monthlyData.get(key)!;
            entry.expense += e.amount;
            entry.profit -= e.amount;
        }
    });

    // Aggregate Revenue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    restocks.forEach((r: any) => {
        const key = getKey(r.createdAt);
        if (monthlyData.has(key)) {
            const entry = monthlyData.get(key)!;
            entry.revenue += (r.totalRevenue || 0);
            entry.profit += (r.totalRevenue || 0);
            // Deduct COGS if tracked in RestockLog, for now simplified
        }
    });

    return {
        chartData: Array.from(monthlyData.values()),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        totalRevenue: restocks.reduce((acc: number, r: any) => acc + (r.totalRevenue || 0), 0),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        totalExpense: expenses.reduce((acc: number, e: any) => acc + e.amount, 0),
        recentExpenses: expenses.slice(0, 5)
    };
}
