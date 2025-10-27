// services/departmentApi.ts
import { api } from '../../../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const departmentApi = {
  // GET /api/v1/roles
  async listDepartment() {
    console.log('📋 [API] Fetching Departments...');
    // TODO: Implementar endpoint GET /api/v1/department
    const departments = await api<any[]>(`${API_BASE_URL}/api/v1/departments`);
    console.log('✅ [API] Departments received:', departments);
    return departments;
  },

};