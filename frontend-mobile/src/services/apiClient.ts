import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  process.env.API_URL ??
  'http://localhost:8000'

const apiClient = axios.create({
  baseURL: `${apiBaseUrl.replace(/\/$/, '')}/api`,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default apiClient
