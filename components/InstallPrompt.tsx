'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

export default function InstallPrompt() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check for iOS
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        // Check if already in standalone mode
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

        if (isIosDevice && !isStandalone) {
            setIsIOS(true);
            setIsVisible(true);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50 flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold">Install VendingOS</h3>
                    <p className="text-sm opacity-90">Add to your home screen for the best experience.</p>
                </div>
                <button onClick={() => setIsVisible(false)} className="opacity-70 hover:opacity-100"><X size={20} /></button>
            </div>

            {isIOS ? (
                <div className="text-sm bg-background/10 p-2 rounded">
                    Tap <span className="font-bold">Share</span> <span className="inline-block border px-1 rounded text-xs">⎋</span> then <span className="font-bold">Add to Home Screen</span> <span className="inline-block border px-1 rounded text-xs">+</span>
                </div>
            ) : (
                <Button onClick={handleInstallClick} variant="secondary" className="w-full gap-2 font-semibold">
                    <Download size={16} /> Install App
                </Button>
            )}
        </div>
    );
}
