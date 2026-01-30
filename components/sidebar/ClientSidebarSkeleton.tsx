import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ClientSidebarSkeleton() {
    return (
        <div className="fixed right-0 top-0 h-screen w-[400px] bg-white shadow-2xl z-40 p-4 space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-3 pb-4 border-b">
                <Skeleton className="h-8 w-3/4" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </div>

            {/* Content Skeletons */}
            <div className="space-y-4">
                {/* Contact Card */}
                <Card className="p-4 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                </Card>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 h-24">
                        <Skeleton className="h-4 w-10 mb-2" />
                        <Skeleton className="h-8 w-16" />
                    </Card>
                    <Card className="p-4 h-24">
                        <Skeleton className="h-4 w-10 mb-2" />
                        <Skeleton className="h-8 w-16" />
                    </Card>
                    <Card className="p-4 h-24">
                        <Skeleton className="h-4 w-10 mb-2" />
                        <Skeleton className="h-8 w-16" />
                    </Card>
                    <Card className="p-4 h-24">
                        <Skeleton className="h-4 w-10 mb-2" />
                        <Skeleton className="h-8 w-16" />
                    </Card>
                </div>

                {/* Locations List */}
                <Card className="p-4">
                    <Skeleton className="h-6 w-1/3 mb-4" />
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </Card>
            </div>
        </div>
    );
}
