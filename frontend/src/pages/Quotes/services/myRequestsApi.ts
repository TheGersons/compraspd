// services/myRequestsApi.ts

import { api } from '../../../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const myRequestsApi = {
  // GET /api/v1/purchase-requests/my-requests
  async listMyRequests() {
    console.log('📋 [API] Fetching my requests...');
    const requests = await api<any[]>(`${API_BASE_URL}/api/v1/purchase-requests/my-requests`);
    console.log('✅ [API] Requests received:', requests);
    return requests;
  },

  // GET /api/v1/purchase-requests/:id/chat
  async listRequestChat(requestId: string) {
    console.log('📨 [API] Fetching chat for request:', requestId);
    const messages = await api<any[]>(`${API_BASE_URL}/api/v1/purchase-requests/${requestId}/chat`);
    console.log('✅ [API] Chat messages received:', messages);
    return messages;
  },

  // POST /api/v1/purchase-requests/:id/chat
  async sendRequestChat(requestId: string, body: string | null, fileIds: string[]) {
    console.log('💬 [API] Sending chat to request:', requestId, { body, fileIds });
    const response = await api(`${API_BASE_URL}/api/v1/purchase-requests/${requestId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ body, fileIds }),
    });
    console.log('✅ [API] Chat sent, response:', response);
    return response;
  },

  // POST /api/v1/purchase-requests/upload-files
  async uploadFiles(files: File[]) {
    console.log('📤 [API] Uploading files:', files.map(f => f.name));
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/v1/purchase-requests/upload-files`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) throw new Error(await res.text());
    const uploaded = await res.json();
    console.log('✅ [API] Files uploaded:', uploaded);
    return uploaded;
  },
};