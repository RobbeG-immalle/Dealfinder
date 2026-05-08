'use client';

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DealsTable } from '@/components/deals/deals-table';
import { ScrapeForm } from '@/components/scrape/scrape-form';
import { ProfitChart } from '@/components/charts/profit-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeals, useDealStats } from '@/hooks/use-deals';
import { TrendingUp, Tag, Search, BarChart2 } from 'lucide-react';
import { formatCurrency, formatROI } from '@/lib/utils';

export default function DashboardPage() {
  const { data: dealsData, isLoading: dealsLoading } = useDeals({ limit: 5, sortBy: 'dealScore' });
  const { data: stats, isLoading: statsLoading } = useDealStats();

  const deals = dealsData?.data ?? [];

  return (
    <AppShell title="Dashboard">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Deals"
          value={statsLoading ? null : String(stats?.totalDeals ?? 0)}
          icon={<Tag className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Avg. Profit"
          value={statsLoading ? null : formatCurrency(stats?.avgProfit ?? 0, 'EUR')}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          title="Avg. ROI"
          value={statsLoading ? null : formatROI(stats?.avgRoi ?? 0)}
          icon={<BarChart2 className="h-5 w-5 text-purple-500" />}
        />
        <StatCard
          title="Active Jobs"
          value={statsLoading ? null : String(stats?.activeJobs ?? 0)}
          icon={<Search className="h-5 w-5 text-orange-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent top deals table */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Deals</h2>
          <DealsTable deals={deals} isLoading={dealsLoading} />
        </div>

        {/* Quick scrape + chart */}
        <div className="space-y-6">
          <ScrapeForm compact />

          {deals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profit Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfitChart deals={deals} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | null; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {value === null ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
