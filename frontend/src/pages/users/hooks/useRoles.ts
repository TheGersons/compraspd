// hooks/useUsers.ts

import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '../service/rolesApi.ts';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.listRoles,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}


