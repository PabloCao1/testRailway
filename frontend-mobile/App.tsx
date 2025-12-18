import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider'
import { RootNavigator } from './src/navigation'
import { database } from './src/database'
import syncService from './src/database/sync/syncService'

export default function App() {
  useEffect(() => {
    syncService.startAutoSync()
    syncService.sync()

    return () => {
      syncService.stopAutoSync()
    }
  }, [])

  return (
    <DatabaseProvider database={database}>
      <RootNavigator />
    </DatabaseProvider>
  )
}
