import 'react-native-gesture-handler'
import React, { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { RootNavigator } from './src/navigation'
import { initDB } from './src/database/db'
import syncService from './src/services/syncService'

export default function App() {
  const [dbReady, setDbReady] = useState(false)

  useEffect(() => {
    initDB()
      .then(() => {
        setDbReady(true)
        // Iniciar auto-sync después de que la DB esté lista
        syncService.startAutoSync()
        syncService.sync() // Sync inicial
      })
      .catch((e) => console.error('Failed to init DB', e))

    return () => {
      syncService.stopAutoSync()
    }
  }, [])

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 12, color: '#374151' }}>Iniciando base de datos...</Text>
      </View>
    )
  }

  return <RootNavigator />
}
