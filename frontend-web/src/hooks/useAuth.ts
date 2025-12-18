import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import { useMutation, useQuery } from '@tanstack/react-query'

export const useAuth = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (tokens) => {
      // First save tokens
      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      
      try {
        // Then get user data with the new token
        const userData = await authService.getMe()
        login(tokens, userData)
      } catch (error) {
        console.error('Failed to get user data:', error)
        // Even if getMe fails, we have valid tokens
        login(tokens, { id: 0, username: 'User', email: '', first_name: '', last_name: '' })
      }
    },
  })

  const { data: userData } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    enabled: isAuthenticated && !user,
  })

  return {
    user: user || userData,
    isAuthenticated,
    login: loginMutation.mutate,
    logout,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  }
}