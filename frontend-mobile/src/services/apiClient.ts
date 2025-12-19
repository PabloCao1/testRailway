import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  process.env.API_URL ??
  'https://testrailway-production-a18c.up.railway.app'

const apiClient = axios.create({
  baseURL: `${apiBaseUrl.replace(/\/$/, '')}/api/`,
})

console.log('📡 API Client initialized with baseURL:', apiClient.defaults.baseURL)

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  async (error) => {
    console.error(`❌ API Error: ${error.response?.status || 'Network Error'} ${error.config?.url}`)
    if (error.response?.data) {
      console.error('📦 Error Data:', JSON.stringify(error.response.data))
    }

    if (error.response?.status === 401) {
      await useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default apiClient
