// services/assignmentsApi.ts
import { api, getToken } from '../../../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const assignmentsApi = {
  async listMyAssignments() {
    console.log('📋 Fetching my assignments...');
    const data = await api<any[]>(`${API_BASE_URL}/api/v1/assignments/my-followups`);
    console.log('✅ Assignments received:', data);
    return data;
  },

  async uploadFiles(files: File[]) {
    console.log('📤 Uploading files:', files.map(f => f.name));
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/v1/assignments/upload-files`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) throw new Error(await res.text());
    const uploaded = await res.json();
    console.log('✅ Files uploaded:', uploaded);
    return uploaded;
  },

  async sendChat(assignmentId: string, body: string | null, fileIds: string[]) {
    console.log('💬 Sending chat to assignment:', assignmentId, { body, fileIds });
    const response = await api(`${API_BASE_URL}/api/v1/assignments/${assignmentId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ body, fileIds }),
    });
    console.log('✅ Chat sent, response:', response);
    return response;
  },

  async listChat(assignmentId: string) {
    console.log('📨 Fetching chat for assignment:', assignmentId);
    const messages = await api<any[]>(`${API_BASE_URL}/api/v1/assignments/${assignmentId}/chat`);
    
    console.log('✅ Chat messages received:', messages);
    return messages;
  },

  async updateFollowUp(assignmentId: string, data: any) {
    console.log('🔄 Updating followup:', assignmentId, data);
     const token = getToken();
    const response = await api(`${API_BASE_URL}/api/v1/assignments/${assignmentId}/followup`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    console.log('✅ Followup updated:', response);
    return response;
  }
};