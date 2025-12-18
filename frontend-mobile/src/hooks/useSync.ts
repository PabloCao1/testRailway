import { useState, useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import syncService from '../database/sync/syncService'

export const useSync = () => {
  const [isOnline, setIsOnline] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false)
    })

    loadSyncStatus()

    return () => unsubscribe()
  }, [])

  const loadSyncStatus = async () => {
    const last = await syncService.getLastSync()
    const pending = await syncService.getPendingCount()
    setLastSync(last)
    setPendingCount(pending)
  }

  const sync = async () => {
    setIsSyncing(true)
    try {
      await syncService.sync()
      await loadSyncStatus()
    } finally {
      setIsSyncing(false)
    }
  }

  return {
    isOnline,
    isSyncing,
    lastSync,
    pendingCount,
    sync,
    refreshStatus: loadSyncStatus
  }
}
