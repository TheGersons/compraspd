// hooks/useQuotesDashboard.ts

import { useQuery } from '@tanstack/react-query';
import { QuoteFilters } from '../../../components/quotes/filters';
import { quotesDashboardApi } from '../services/quotesDashboardApi';

export function useQuotesDashboard(filters: QuoteFilters) {
  return useQuery({
    queryKey: ['quotes-dashboard', filters],
    queryFn: () => quotesDashboardApi.getDashboardData(filters),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useQuotesStats(period: string) {
  return useQuery({
    queryKey: ['quotes-stats', period],
    queryFn: () => quotesDashboardApi.getStats(period),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}