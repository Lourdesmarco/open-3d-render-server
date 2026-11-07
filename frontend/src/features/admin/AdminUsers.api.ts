import { apiRequest } from '../../api/api';

export interface UserItem {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  role: 'student' | 'admin';
}


export async function fetchUsersRequest(): Promise<UserItem[]> {
  return apiRequest<UserItem[]>('/users');
}

export async function updateUserRoleRequest(userId: string, role: 'admin' | 'user'): Promise<void> {
  return apiRequest(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function deleteUserRequest(userId: string): Promise<void> {
  return apiRequest(`/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function createUserRequest(payload: CreateUserPayload): Promise<UserItem> {
  return apiRequest<UserItem>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}