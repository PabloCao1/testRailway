import { create } from 'zustand'
import { getStorage } from '../utils/storage'

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  login: (tokens: { access: string; refresh: string }, user: User) => Promise<void>
  logout: () => Promise<void>
  loadTokens: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,

  login: async (tokens, user) => {
    const storage = getStorage()
    await storage.setItem('access_token', tokens.access)
    await storage.setItem('refresh_token', tokens.refresh)
    set({
      user,
      accessToken: tokens.access,
      refreshToken: tokens.refresh,
      isAuthenticated: true,
    })
  },

  logout: async () => {
    const storage = getStorage()
    await storage.removeItem('access_token')
    await storage.removeItem('refresh_token')
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  },

  loadTokens: async () => {
    try {
      const storage = getStorage()
      const accessToken = await storage.getItem('access_token')
      const refreshToken = await storage.getItem('refresh_token')

      if (accessToken && refreshToken) {
        // We have tokens, app is authenticated
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })

        try {
          // Attempt to get fresh user data
          const { authService } = await import('../services/authService')
          const userData = await authService.getMe(accessToken)
          set({ user: userData, isHydrated: true })
        } catch (e) {
          console.log('⚠️ Could not refresh user data on hydration, using tokens only')
          set({ isHydrated: true })
        }
      } else {
        set({ isHydrated: true, isAuthenticated: false })
      }
    } catch (error) {
      console.error('Error loading tokens:', error)
      set({ isHydrated: true, isAuthenticated: false })
    }
  },
}))
