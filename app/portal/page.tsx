'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogOut, Save, MapPin, User, BarChart } from 'lucide-react';
import RevenueChart from '@/components/sidebar/RevenueChart';

export default function PortalPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        phoneNumber: '',
        notes: ''
    });

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setFormData({
                phoneNumber: user.phoneNumber || '',
                notes: user.notes || ''
            });
        }
    }, [user]);

    if (isLoading || !user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const handleSave = () => {
        toast.success('Profile updated successfully!');
        // In a real app, this would make an API call to Airtable
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Nav */}
            <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        VendingPreneur Portal
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600">
                        {user.fullName}
                    </span>
                    <Button variant="outline" size="sm" onClick={logout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 space-y-6">

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                            <BarChart className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${(user.totalMonthlyRevenue || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Locations</CardTitle>
                            <MapPin className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{user.totalNumberOfLocations || 0}</div>
                            <p className="text-xs text-muted-foreground">5 machines deployed</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Membership</CardTitle>
                            <User className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{user.membershipLevel || 'Member'}</div>
                            <p className="text-xs text-muted-foreground">Renewed April 2026</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Charts */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Revenue History</CardTitle>
                                <CardDescription>Your performance over the last 6 months.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RevenueChart currentMonthlyRevenue={user.totalMonthlyRevenue || 0} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Edit Profile */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Profile</CardTitle>
                                <CardDescription>Update your contact info.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input value={user.fullName} disabled className="bg-slate-100 cursor-not-allowed" />
                                    <p className="text-[10px] text-muted-foreground">Contact support to change name.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone Number</label>
                                    <Input
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData(p => ({ ...p, phoneNumber: e.target.value }))}
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Notes</label>
                                    <Input
                                        value={formData.notes}
                                        onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                                        placeholder="Delivery instructions..."
                                    />
                                </div>
                                <Button className="w-full" onClick={handleSave}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </main>
        </div>
    );
}
