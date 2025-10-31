// hooks/useHistory.ts

import { useQuery } from '@tanstack/react-query';
import { historyApi } from '../services/historyApi';

export function useAllRequests() {
  return useQuery({
    queryKey: ['all-requests'],
    queryFn: historyApi.listAllRequests,
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
  });
}

export function useMyRequests() {
  return useQuery({
    queryKey: ['my-requests'],
    queryFn: historyApi.ListMyRequests,
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
  });
}