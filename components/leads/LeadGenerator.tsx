'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, MapPin, Plus, Star, Check, Download } from 'lucide-react';
import { Lead, VendingpreneurClient } from '@/lib/types';
import { toast } from 'sonner';
import { GlassCard } from '@/components/ui/glass-card';

interface LeadGeneratorProps {
    client: VendingpreneurClient;
    onLeadsFound: (leads: Lead[]) => void;
}

export default function LeadGenerator({ client, onLeadsFound }: LeadGeneratorProps) {
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState([3]); // Miles
    const [minRating, setMinRating] = useState(3.5); // Phase 14: Quality Filter
    const [minReviews, setMinReviews] = useState(10); // Phase 14: Traffic Proxy
    const [type, setType] = useState('gym');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [savedLeads, setSavedLeads] = useState<Set<string>>(new Set());

    const fetchLeads = async () => {
        if (!client.latitude || !client.longitude) {
            toast.error('Client has no location data to search around.');
            return;
        }

        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                lat: (client.latitude || 0).toString(),
                lng: (client.longitude || 0).toString(),
                radius: (radius[0] || 3).toString(),
                type,
                minRating: minRating.toString(),
                minReviews: minReviews.toString()
            });

            const res = await fetch(`/api/leads?${queryParams}`);
            const data = await res.json();

            if (data.error) throw new Error(data.error);
            if (data.note) toast.info(data.note);

            // Phase 14: Intelligent Deduplication
            const rawLeads: Lead[] = data.leads || [];

            const existingLocations = [
                client.fullAddress,
                ...(client.locations || []).map(l => l.address)
            ].filter(Boolean).map(a => a!.toLowerCase());

            const uniqueLeads = rawLeads.filter(lead => {
                if (lead.name.toLowerCase().includes(client.businessName?.toLowerCase() || '')) return false;
                const leadAddr = lead.address.toLowerCase();
                return !existingLocations.some(ex => leadAddr.includes(ex) || ex.includes(leadAddr));
            });

            setLeads(uniqueLeads);
            onLeadsFound(uniqueLeads);

            const diff = rawLeads.length - uniqueLeads.length;
            if (diff > 0) {
                toast.success(`Found ${uniqueLeads.length} leads (removed ${diff} duplicates).`);
            } else {
                toast.success(`Found ${uniqueLeads.length} potential leads!`);
            }

        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch leads.');
        } finally {
            setLoading(false);
        }
    };

    const handleCRMAdd = async (lead: Lead) => {
        if (savedLeads.has(lead.id)) return;

        const toastId = toast.loading(`Saving ${lead.name}...`);
        try {
            const res = await fetch('/api/crm/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead,
                    clientId: client.id
                })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(`Saved ${lead.name} to Leads!`, { id: toastId });
                setSavedLeads(prev => new Set(prev).add(lead.id));
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error(error);
            toast.success(`Saved ${lead.name} to CRM (Mock Mode)`, { id: toastId });
            setSavedLeads(prev => new Set(prev).add(lead.id));
        }
    };

    const exportToCSV = () => {
        if (leads.length === 0) return;

        const headers = ["Name", "Business Type", "Address", "Rating", "Review Count", "Google Place ID"];
        const rows = leads.map(lead => [
            `"${lead.name.replace(/"/g, '""')}"`,
            lead.type,
            `"${lead.address.replace(/"/g, '""')}"`,
            lead.rating || "",
            lead.user_ratings_total || 0,
            lead.place_id || ""
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `leads-${client.businessName || 'client'}-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <GlassCard animated={true} className="p-4 bg-slate-900/50 border-white/10">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    Find New Locations
                </h3>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400">Business Type</label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="gym">Gym / Fitness Center</SelectItem>
                                <SelectItem value="office">Corporate Office</SelectItem>
                                <SelectItem value="car_dealer">Car Dealership</SelectItem>
                                <SelectItem value="school">School / University</SelectItem>
                                <SelectItem value="hospital">Hospital / Clinic</SelectItem>
                                <SelectItem value="shopping_mall">Shopping Mall</SelectItem>
                                <SelectItem value="apartment">Apartment Complex</SelectItem>
                                <SelectItem value="warehouse">Warehouse / Industrial</SelectItem>
                                <SelectItem value="night_club">Lounge / Night Club</SelectItem>
                                <SelectItem value="hotel">Hotel / Motel</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400">Min Rating</label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-amber-500">{minRating.toFixed(1)}</span>
                                <Slider
                                    value={[minRating]}
                                    onValueChange={(val) => setMinRating(val[0] || 3.5)}
                                    min={1}
                                    max={5}
                                    step={0.5}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400">Min Reviews</label>
                            <Select value={minReviews.toString()} onValueChange={(v) => setMinReviews(parseInt(v))}>
                                <SelectTrigger className="h-8 text-xs bg-slate-900/50 border-white/10 text-slate-300">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="0">Any</SelectItem>
                                    <SelectItem value="10">10+</SelectItem>
                                    <SelectItem value="50">50+</SelectItem>
                                    <SelectItem value="100">100+ (Established)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs font-medium text-slate-400">Search Radius</label>
                            <span className="text-xs font-bold text-white">{radius[0]} miles</span>
                        </div>
                        <Slider
                            value={radius}
                            onValueChange={setRadius}
                            min={1}
                            max={10}
                            step={1}
                            className="py-2"
                        />
                    </div>

                    <Button
                        onClick={fetchLeads}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 border border-blue-400/20"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {loading ? 'Scanning...' : 'Generate Leads'}
                    </Button>
                </div>
            </GlassCard>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">Results ({leads.length})</h4>
                    {leads.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                            onClick={exportToCSV}
                        >
                            <Download className="h-3 w-3 mr-2" />
                            Export CSV
                        </Button>
                    )}
                </div>

                {leads.length === 0 && !loading && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No leads generated yet. Run a scan above.
                    </div>
                )}

                <div className="space-y-2">
                    {leads.map((lead) => (
                        <GlassCard key={lead.id} className="p-3 bg-slate-800/50 hover:bg-slate-700/50 border-white/5 transition-colors group">
                            <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <h5 className="font-medium text-sm text-white truncate group-hover:text-blue-300 transition-colors">{lead.name}</h5>
                                    <p className="text-xs text-slate-400 truncate">{lead.address}</p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
                                        <Star className="h-3 w-3 fill-current" />
                                        <span>{lead.rating || 'N/A'}</span>
                                        <span className="text-slate-600">•</span>
                                        <span className="text-slate-400">{lead.user_ratings_total || 0} reviews</span>

                                        {(lead.rating || 0) >= 4.5 && (lead.user_ratings_total || 0) > 50 && (
                                            <span className="ml-2 flex items-center gap-0.5 text-orange-500 font-bold animate-pulse" title="High Quality Lead">
                                                🔥 Hot
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant={savedLeads.has(lead.id) ? "secondary" : "outline"}
                                    className="h-8 w-8 p-0 shrink-0 border-white/10 bg-white/5 hover:bg-blue-500/20 text-blue-400"
                                    onClick={() => handleCRMAdd(lead)}
                                    disabled={savedLeads.has(lead.id)}
                                >
                                    {savedLeads.has(lead.id) ? (
                                        <Check className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
}
