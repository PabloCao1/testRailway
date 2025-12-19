import axios from 'axios'
import apiClient from './apiClient'
import { createAuthService } from '../../../shared/services/authService'

const sharedAuthService = createAuthService(apiClient)

export const authService = {
  async login(credentials: { username: string; password: string }) {
    const response = await apiClient.post('token/', credentials)
    return response.data
  },

  async getMe(token?: string) {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    const response = await apiClient.get('me/', config)
    return response.data
  },

  async refreshToken(refreshToken: string) {
    const response = await apiClient.post('token/refresh/', { refresh: refreshToken })
    return response.data
  },
}
