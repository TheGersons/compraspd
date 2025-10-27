// services/RolesApi.ts
import { api } from '../../../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const rolesApi = {
  // GET /api/v1/roles
  async listRoles() {
    console.log('📋 [API] Fetching Roles...');
    // TODO: Implementar endpoint GET /api/v1/roles
    const roles = await api<any[]>(`${API_BASE_URL}/api/v1/roles`);
    console.log('✅ [API] Roles received:', roles);
    return roles;
  },

};