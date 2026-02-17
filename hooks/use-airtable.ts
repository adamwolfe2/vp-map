import { useState, useEffect, useRef } from 'react';
import { VendingpreneurClient } from '@/lib/types';

interface UseAirtableOptions {
    pollingInterval?: number; // ms, default 30000
    enabled?: boolean;
}

interface UseAirtableResult {
    clients: VendingpreneurClient[];
    isLoading: boolean;
    error: Error | null;
    lastUpdated: Date | null;
    isPolling: boolean;
    refresh: () => Promise<void>;
}

export function useAirtableData({ pollingInterval = 30000, enabled = true }: UseAirtableOptions = {}): UseAirtableResult {
    const [clients, setClients] = useState<VendingpreneurClient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Keep track of mounted state to prevent state updates after unmount
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/clients');
            if (!response.ok) throw new Error('Failed to fetch data');

            const data = await response.json();

            if (data.success && isMounted.current) {
                // Determine if data actually changed could be done here (deep compare)
                // For now, we just update and set timestamp
                setClients(prev => {
                    const next = data.data;
                    // Simple length check or JSON stringify to avoid unnecessary re-renders if needed?
                    // For "Live Indicator", we WANT to know if it updated.
                    if (JSON.stringify(prev) !== JSON.stringify(next) || prev.length === 0) {
                        setLastUpdated(new Date());
                    }
                    return next;
                });
                setError(null);
            }
        } catch (err: any) {
            if (isMounted.current) {
                console.warn('[Geo] API Error:', err.message || err); // Show in Debug Overlay
                console.error('Error polling Airtable:', err);
                setError(err);
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    };

    // Initial Fetch
    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled]);

    // Polling Interval
    useEffect(() => {
        if (!enabled || !pollingInterval) return;

        const intervalId = setInterval(fetchData, pollingInterval);
        return () => clearInterval(intervalId);
    }, [enabled, pollingInterval]);

    return {
        clients,
        isLoading,
        error,
        lastUpdated,
        isPolling: enabled && !!pollingInterval,
        refresh: fetchData
    };
}
