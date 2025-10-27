// hooks/usedepartments.ts
import { useQuery } from '@tanstack/react-query';
import { departmentApi } from '../service/departmentsApi.ts';

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: departmentApi.listDepartment,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}


