// hooks/useMyRequests.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { myRequestsApi } from '../services/myRequestsApi.ts';

//type ChatMessage = {
//  id: string;
//  body?: string;
//  createdAt: string;
//  senderId: string;
//  files: any[];
//  sender?: {
//    id: string;
//    fullName: string;
//  };
//};

export function useMyRequests() {
  return useQuery({
    queryKey: ['my-requests'],
    queryFn: myRequestsApi.listMyRequests,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useRequestChat(requestId: string | null) {
  return useQuery({
    queryKey: ['request-chat', requestId],
    queryFn: () => requestId ? myRequestsApi.listRequestChat(requestId) : Promise.resolve([]),
    enabled: !!requestId,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });
}

export function useSendRequestChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, body, fileIds }: { 
      requestId: string; 
      body: string | null; 
      fileIds: string[] 
    }) => myRequestsApi.sendRequestChat(requestId, body, fileIds),
    onSuccess: (newMessage: any, variables) => {
      console.log('✅ Mensaje enviado exitosamente:', newMessage);
      
      queryClient.setQueryData(
        ['request-chat', variables.requestId],
        (oldMessages: any[] = []) => {
          const exists = oldMessages.some((m: any) => m.id === newMessage.id);
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