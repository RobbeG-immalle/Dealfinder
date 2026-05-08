'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scrapeApi } from '@/lib/api';
import type { StartScrapePayload } from '@/lib/api';

export function useScrapeJobs(page = 1) {
  return useQuery({
    queryKey: ['scrape-jobs', page],
    queryFn: () => scrapeApi.getJobs(page),
  });
}

export function useStartScrape() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartScrapePayload) => scrapeApi.start(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scrape-jobs'] });
    },
  });
}
