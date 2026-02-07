import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, User } from 'lucide-react';

const PrivacyToggle = dynamic(() => import('./PrivacyToggle'), {
    ssr: false,
    loading: () => <div className="h-10 w-40 bg-muted/20 animate-pulse rounded-lg" />
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Leaderboard({ leaders, myStatus }: { leaders: any[], myStatus: any }) {
    const points = myStatus?.points || 0;
    const isPublic = myStatus?.isPublic || false;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* My Status Card */}
            <Card className="md:col-span-1 border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User size={20} /> My Stats
                    </CardTitle>
                    <CardDescription>Your contribution rank</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center py-4">
                        <div className="text-4xl font-bold text-primary">{points.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Points</div>
                    </div>

                    <PrivacyToggle initialIsPublic={isPublic} />

                    <div className="text-xs text-muted-foreground">
                        * Enable Public Profile to appear on the community leaderboard.
                    </div>
                </CardContent>
            </Card>

            {/* Leaderboard List */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy size={20} className="text-yellow-500" /> Top Operators
                    </CardTitle>
                    <CardDescription>Global community rankings</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {leaders.map((leader, index) => (
                            <div key={leader.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full 
                                        ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-slate-100 text-slate-700' :
                                                index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-transparent text-muted-foreground'}`}>
                                        {index + 1}
                                    </div>
                                    <div className="font-medium">
                                        {leader.name || 'Anonymous Operator'}
                                    </div>
                                </div>
                                <div className="font-mono font-semibold text-primary">
                                    {(leader.points || 0).toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {leaders.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No public operators yet. Be the first!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
