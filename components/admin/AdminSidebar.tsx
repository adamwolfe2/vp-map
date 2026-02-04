'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Clients', href: '/admin/clients', icon: Users },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="w-64 h-screen flex flex-col p-4 border-r border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl">
            <div className="mb-8 px-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">VP Admin</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Super User Platform</p>
            </div>

            <div className="flex-1 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                                isActive
                                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 pt-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
