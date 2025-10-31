// services/historyApi.ts

import { api } from "../../../lib/api";



const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const historyApi = {
  // GET /api/v1/purchase-requests
  async listAllRequests() {
    console.log('📋 [API] Fetching all requests...');
    const requests = await api<any[]>(`${API_BASE_URL}/api/v1/purchase-requests/history/all`);
    console.log('✅ [API] Requests received:', requests);
    return requests;
  },


  async ListMyRequests(){
    console.log('📋 [API] Fetching my requests...');
    const requests = await api<any[]>(`${API_BASE_URL}/api/v1/purchase-requests/history/my`);
    console.log('✅ [API] Requests received:', requests);
    return requests;
  }
};