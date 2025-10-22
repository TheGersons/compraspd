// services/assignmentsApi.ts
import { api, getToken } from '../../../lib/api'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

export const assignmentsApi = {
  // Obtener mis asignaciones
  async listMyAssignments() {
    return api<any[]>(`${API_BASE_URL}/assignments/my-followups`);
  },

  // Subir archivos (este necesita manejo especial porque no es JSON)
  async uploadFiles(files: File[]) {
    const token = getToken();
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const res = await fetch(`${API_BASE_URL}/assignments/upload-files`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // NO incluir Content-Type, el browser lo configura automáticamente con el boundary
      },
      body: formData,
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Enviar mensaje de chat
  async sendChat(assignmentId: string, body: string | null, fileIds: string[]) {
    return api(`${API_BASE_URL}/assignments/${assignmentId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ body, fileIds }),
    });
  },

  // Listar chat
  async listChat(assignmentId: string) {
    return api<any[]>(`${API_BASE_URL}/assignments/${assignmentId}/chat`);
  },

  // Actualizar seguimiento
  async updateFollowUp(assignmentId: string, data: any) {
    const token = getToken();
    return api(`${API_BASE_URL}/assignments/${assignmentId}/followup`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }
};