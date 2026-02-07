'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Lock } from 'lucide-react';
import { togglePrivacy } from '@/lib/actions/gamification';
import { toast } from 'sonner';

export default function PrivacyToggle({ initialIsPublic }: { initialIsPublic: boolean }) {
    const [isPublic, setIsPublic] = useState(initialIsPublic);

    const handleToggle = async (checked: boolean) => {
        setIsPublic(checked);
        try {
            await togglePrivacy(checked);
            toast.success(checked ? 'You are now visible on the leaderboard' : 'You are now hidden');
        } catch {
            setIsPublic(!checked); // Revert
            toast.error('Failed to update privacy settings');
        }
    };

    return (
        <div className="flex items-center justify-between space-x-2 border rounded-lg p-3 bg-background">
            <div className="flex items-center gap-2">
                {isPublic ? <Globe size={16} className="text-green-500" /> : <Lock size={16} className="text-muted-foreground" />}
                <Label htmlFor="privacy-mode" className="text-sm cursor-pointer">
                    {isPublic ? 'Public Profile' : 'Private Profile'}
                </Label>
            </div>
            <Switch id="privacy-mode" checked={isPublic} onCheckedChange={handleToggle} />
        </div>
    );
}
