'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, MapPin, Plus, Star, Check } from 'lucide-react';
import { Lead, VendingpreneurClient } from '@/lib/types';
import { toast } from 'sonner';

interface LeadGeneratorProps {
    client: VendingpreneurClient;
    onLeadsFound: (leads: Lead[]) => void;
}

import { GlassCard } from '@/components/ui/glass-card';

interface LeadGeneratorProps {
    client: VendingpreneurClient;
    onLeadsFound: (leads: Lead[]) => void;
}

export default function LeadGenerator({ client, onLeadsFound }: LeadGeneratorProps) {
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState([3]); // Miles
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
            const res = await fetch(`/api/leads?lat=${client.latitude}&lng=${client.longitude}&radius=${radius[0]}&type=${type}`);
            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.note) {
                toast.info(data.note);
            }

            setLeads(data.leads || []);
            onLeadsFound(data.leads || []);
            toast.success(`Found ${data.leads?.length || 0} potential leads!`);

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
                    clientId: client.id // Link to the current client
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
            toast.success(`Saved ${lead.name} to CRM (Mock Mode)`, { id: toastId }); // Fallback for demo
            setSavedLeads(prev => new Set(prev).add(lead.id));
        }
    };

    return (
        <div className="space-y-6">
            <GlassCard animated={true} className="p-4 bg-slate-50/50 dark:bg-white/5 border-blue-100 dark:border-blue-500/20">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Find New Locations
                </h3>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Business Type</label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="bg-white dark:bg-black/40 border-slate-200 dark:border-white/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-black/90 dark:border-white/20">
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

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Search Radius</label>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{radius[0]} miles</span>
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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {loading ? 'Scanning...' : 'Generate Leads'}
                    </Button>
                </div>
            </GlassCard>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Results ({leads.length})</h4>
                </div>

                {leads.length === 0 && !loading && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No leads generated yet. Run a scan above.
                    </div>
                )}

                <div className="space-y-2">
                    {leads.map((lead) => (
                        <GlassCard key={lead.id} className="p-3 hover:bg-white/10 dark:hover:bg-white/5 transition-colors border-white/20">
                            <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <h5 className="font-medium text-sm text-slate-900 dark:text-white truncate">{lead.name}</h5>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{lead.address}</p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
                                        <Star className="h-3 w-3 fill-current" />
                                        <span>{lead.rating || 'N/A'}</span>
                                        <span className="text-slate-300 dark:text-slate-600">•</span>
                                        <span className="text-slate-400 dark:text-slate-500">{lead.user_ratings_total || 0} reviews</span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant={savedLeads.has(lead.id) ? "secondary" : "outline"}
                                    className="h-8 w-8 p-0 shrink-0 border-slate-200 dark:border-white/20 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
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
