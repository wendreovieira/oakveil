import { apiClient } from '@/api/client'
import type { LoginRequest, LoginResponse } from '@/types/auth'

export async function login(payload: LoginRequest) {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/login', payload)
  return data
}
