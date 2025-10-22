// hooks/useAssignments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi } from '../services/assignmentsApi';

export function useMyAssignments() {
  return useQuery({
    queryKey: ['my-assignments'],
    queryFn: assignmentsApi.listMyAssignments,
    refetchInterval: 30000,
  });
}

export function useAssignmentChat(assignmentId: string | null) {
  return useQuery({
    queryKey: ['assignment-chat', assignmentId],
    queryFn: () => assignmentId ? assignmentsApi.listChat(assignmentId) : Promise.resolve([]),
    enabled: !!assignmentId,
    refetchInterval: 5000,
  });
}

export function useUpdateFollowUp() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: any }) =>
      assignmentsApi.updateFollowUp(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-assignments'] });
    },
  });
}

export function useSendChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, body, fileIds }: { 
      assignmentId: string; 
      body: string | null; 
      fileIds: string[] 
    }) => assignmentsApi.sendChat(assignmentId, body, fileIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['assignment-chat', variables.assignmentId] 
      });
    },
  });
}