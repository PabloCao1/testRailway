import axios from 'axios'
import apiClient from './apiClient'
import { createAuthService } from '../../../shared/services/authService'

const sharedAuthService = createAuthService(apiClient)

export const authService = {
  async login(credentials: { username: string; password: string }) {
    const response = await axios.post('http://localhost:8000/api/token/', credentials)
    return response.data
  },

  async getMe() {
    const response = await apiClient.get('/me/')
    return response.data
  },

  async refreshToken(refreshToken: string) {
    const response = await axios.post('http://localhost:8000/api/token/refresh/', { refresh: refreshToken })
    return response.data
  },
}
