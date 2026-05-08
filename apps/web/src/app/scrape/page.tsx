'use client';

import { AppShell } from '@/components/layout/app-shell';
import { ScrapeForm } from '@/components/scrape/scrape-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useScrapeJobs } from '@/hooks/use-scrape';
import { formatDate } from '@/lib/utils';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

export default function ScrapePage() {
  const { data, isLoading } = useScrapeJobs();
  const jobs = data?.data ?? [];

  return (
    <AppShell title="Scrape">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScrapeForm />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            )}
            {!isLoading && jobs.length === 0 && (
              <p className="text-sm text-gray-500">No scrape jobs yet. Start one above!</p>
            )}
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {job.marketplace} — {job.query}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(job.createdAt)}</p>
                    {job.error && (
                      <p className="text-xs text-red-500 mt-1">{job.error}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      statusColors[job.status] ?? 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
