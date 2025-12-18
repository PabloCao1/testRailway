import { User } from '../types'

export const createAuthService = (apiClient: any) => ({
  async login(username: string, password: string) {
    const response = await apiClient.post<{ access: string; refresh: string; user: User }>(
      '/auth/login/',
      { username, password }
    )
    return response.data
  },

  async logout() {
    // Implementar si hay endpoint de logout
  },

  async refreshToken(refresh: string) {
    const response = await apiClient.post<{ access: string }>('/auth/refresh/', { refresh })
    return response.data
  },

  async getCurrentUser() {
    const response = await apiClient.get<User>('/auth/user/')
    return response.data
  },
})
