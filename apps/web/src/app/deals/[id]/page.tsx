'use client';

import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { DealDetail } from '@/components/deals/deal-detail';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useDeal } from '@/hooks/use-deals';
import { ArrowLeft } from 'lucide-react';

export default function DealDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: deal, isLoading, error } = useDeal(params.id);

  return (
    <AppShell title="Deal Detail">
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Deals
        </Button>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            Failed to load deal: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        )}

        {deal && <DealDetail deal={deal} />}
      </div>
    </AppShell>
  );
}
