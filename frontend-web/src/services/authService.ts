import axios from 'axios'
import apiClient from './apiClient'

export const authService = {
  async login(credentials: { username: string; password: string }) {
    const response = await axios.post('/api/token/', credentials)
    return response.data
  },

  async getMe() {
    const response = await apiClient.get('/me/')
    return response.data
  },

  async refreshToken(refreshToken: string) {
    const response = await axios.post('/api/token/refresh/', { refresh: refreshToken })
    return response.data
  },
}