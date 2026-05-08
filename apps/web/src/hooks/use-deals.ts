'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi } from '@/lib/api';
import type { DealsFilter } from '@/lib/api';

export function useDeals(filter?: DealsFilter) {
  return useQuery({
    queryKey: ['deals', filter],
    queryFn: () => dealsApi.getAll(filter),
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: () => dealsApi.getOne(id),
    enabled: !!id,
  });
}

export function useDealStats() {
  return useQuery({
    queryKey: ['deals', 'stats'],
    queryFn: () => dealsApi.getStats(),
  });
}
