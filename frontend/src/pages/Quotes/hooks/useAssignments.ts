// hooks/useAssignments.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi } from '../services/assignmentsApi';

export function useMyAssignments() {
  return useQuery({
    queryKey: ['my-assignments'],
    queryFn: assignmentsApi.listMyAssignments,
    staleTime: Infinity,
  });
}

export function useAssignmentChat(assignmentId: string | null) {
  return useQuery({
    queryKey: ['assignment-chat', assignmentId],
    queryFn: () => assignmentId ? assignmentsApi.listChat(assignmentId) : Promise.resolve([]),
    enabled: !!assignmentId,
    staleTime: Infinity,
  });
}

export function useUpdateFollowUp() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: any }) =>
      assignmentsApi.updateFollowUp(assignmentId, data),
    onSuccess: (_, variables) => {
      // ✅ Actualiza solo la asignación específica en el cache
      queryClient.setQueryData(['my-assignments'], (old: any[] = []) => {
        return old.map(assignment => 
          assignment.id === variables.assignmentId
            ? { ...assignment, ...variables.data }
            : assignment
        );
      });
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
    onSuccess: (newMessage: any, variables) => { // ✅ Usa 'any' temporalmente
      console.log('✅ Mensaje enviado exitosamente:', newMessage);
      
      queryClient.setQueryData(
        ['assignment-chat', variables.assignmentId],
        (oldMessages: any[] = []) => {
          const exists = oldMessages.some(m => m.id === newMessage.id);
          if (exists) return oldMessages;
          
          return [...oldMessages, newMessage];
        }
      );
    },
    onError: (error) => {
      console.error('❌ Error al enviar mensaje:', error);
    }
  });
}