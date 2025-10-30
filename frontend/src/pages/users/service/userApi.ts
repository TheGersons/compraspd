// services/usersApi.ts

import { api } from '../../../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type Role = { name: string };
type User = {
  id: string;
  fullName: string;
  email: string;
  role?: Role;
  departmentId?: string;
  isActive?: boolean;
};

export const usersApi = {
  // GET /api/v1/users
  async listUsers() {
    console.log('📋 [API] Fetching users...');
    // TODO: Implementar endpoint GET /api/v1/users
    const users = await api<any[]>(`${API_BASE_URL}/api/v1/users`);
    console.log('✅ [API] Users received:', users);
    return users;
  },

  // POST /api/v1/users
  async createUser(data: any) {
    console.log('➕ [API] Creating user:', data);
    // TODO: Implementar endpoint POST /api/v1/users
    const newUser = await api(`${API_BASE_URL}/api/v1/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('✅ [API] User created:', newUser);
    return newUser;
  },

  // PATCH /api/v1/users/:id
  async updateUser(userId: string, data: any) {
    console.log('🔄 [API] Updating user:', userId, data);
    // TODO: Implementar endpoint PATCH /api/v1/users/:id
    const updatedUser = await api(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    console.log('✅ [API] User updated:', updatedUser);
    return updatedUser;
  },

  // DELETE /api/v1/users/:id
  async deleteUser(userId: string) {
    console.log('🗑️ [API] Deleting user:', userId);
    // TODO: Implementar endpoint DELETE /api/v1/users/:id
    await api(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'DELETE',
    });
    console.log('✅ [API] User deleted');
  },


  //Me
  async me(){
    console.log('✅ [API] Recuperando mi data')

    const User = await api<User>(`${API_BASE_URL}/api/v1/auth/me`);
    console.log('✅ [API] Me received:', User);
    return User;
  }
};