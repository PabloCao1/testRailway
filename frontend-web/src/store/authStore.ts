import { create } from 'zustand'

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
  login: (tokens: { access: string; refresh: string }, user: User) => void
  logout: () => void
  setTokens: (tokens: { access: string; refresh: string }) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  
  login: (tokens, user) => {
    console.log('Login called with:', { tokens, user })
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    set({
      user,
      accessToken: tokens.access,
      refreshToken: tokens.refresh,
      isAuthenticated: true,
    })
    console.log('Auth state updated, isAuthenticated:', true)
  },
  
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  },
  
  setTokens: (tokens) => {
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    set({
      accessToken: tokens.access,
      refreshToken: tokens.refresh,
      isAuthenticated: true,
    })
  },
}))