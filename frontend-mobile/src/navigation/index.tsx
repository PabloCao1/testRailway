import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { useAuthStore } from '../store/authStore'
import { AuthStack } from './AuthStack'
import { AppDrawer } from './AppDrawer'

export function RootNavigator() {
  const { isAuthenticated, loadTokens } = useAuthStore()

  useEffect(() => {
    loadTokens()
  }, [])

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppDrawer /> : <AuthStack />}
    </NavigationContainer>
  )
}