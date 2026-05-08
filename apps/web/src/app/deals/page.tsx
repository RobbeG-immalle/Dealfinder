'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { DealsTable } from '@/components/deals/deals-table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useDeals } from '@/hooks/use-deals';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MARKETPLACES = ['ALL', 'TWEEDEHANDS', 'EBAY', 'VINTED', 'FACEBOOK'];
const PAGE_SIZE = 20;

export default function DealsPage() {
  const [page, setPage] = useState(1);
  const [marketplace, setMarketplace] = useState('ALL');
  const [minRoi, setMinRoi] = useState('');

  const { data, isLoading } = useDeals({
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    marketplace: marketplace !== 'ALL' ? marketplace : undefined,
    minRoi: minRoi ? Number(minRoi) : undefined,
    sortBy: 'dealScore',
  });

  const deals = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AppShell title="Deals">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select onValueChange={setMarketplace} value={marketplace}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Marketplaces" />
            </SelectTrigger>
            <SelectContent>
              {MARKETPLACES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m === 'ALL' ? 'All Marketplaces' : m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Min ROI %"
            type="number"
            value={minRoi}
            onChange={(e) => { setMinRoi(e.target.value); setPage(1); }}
            className="w-32"
          />

          <Button variant="outline" onClick={() => { setMarketplace('ALL'); setMinRoi(''); setPage(1); }}>
            Reset
          </Button>
        </div>

        <DealsTable deals={deals} isLoading={isLoading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages} — {total} deals
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
