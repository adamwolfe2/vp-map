'use client';

import React, { useEffect, useState } from 'react';

export default function ClientPageWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="p-8 text-center text-muted-foreground">Loading Page...</div>;
    }

    return <>{children}</>;
}
