import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useSync } from '../hooks/useSync'

export default function SyncScreen() {
  const { isOnline, isSyncing, lastSync, pendingCount, sync } = useSync()

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Estado de Sincronización</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.label}>Conexión:</Text>
          <View style={[styles.badge, isOnline ? styles.online : styles.offline]}>
            <Text style={styles.badgeText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.label}>Última sincronización:</Text>
          <Text style={styles.value}>
            {lastSync ? new Date(lastSync).toLocaleString() : 'Nunca'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.label}>Pendientes de sincronizar:</Text>
          <Text style={styles.value}>{pendingCount}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, (!isOnline || isSyncing) && styles.buttonDisabled]}
          onPress={sync}
          disabled={!isOnline || isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sincronizar Ahora</Text>
          )}
        </TouchableOpacity>

        {!isOnline && (
          <Text style={styles.warning}>
            Sin conexión a internet. Los datos se sincronizarán automáticamente cuando se restablezca la conexión.
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  online: {
    backgroundColor: '#4caf50',
  },
  offline: {
    backgroundColor: '#f44336',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warning: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 4,
    color: '#856404',
  },
})
