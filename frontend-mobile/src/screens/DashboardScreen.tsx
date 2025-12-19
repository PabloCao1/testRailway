import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { getDB } from '../database/db'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export const DashboardScreen = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadStats = async () => {
    try {
      const db = getDB()

      const [instCount, visitasCount, unsyncedVisitas, unsyncedInst] = await Promise.all([
        db.getFirstAsync<any>('SELECT COUNT(*) as count FROM instituciones'),
        db.getFirstAsync<any>('SELECT COUNT(*) as count FROM visitas'),
        db.getFirstAsync<any>('SELECT COUNT(*) as count FROM visitas WHERE synced = 0'),
        db.getFirstAsync<any>('SELECT COUNT(*) as count FROM instituciones WHERE synced = 0')
      ])

      setStats({
        total_instituciones: instCount?.count || 0,
        total_visitas: visitasCount?.count || 0,
        pendientes_sinc: (unsyncedVisitas?.count || 0) + (unsyncedInst?.count || 0),
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadStats()
  }

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  )

  const StatCard = ({ title, value, icon, colors, subtitle }: any) => (
    <LinearGradient colors={colors} style={styles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.statHeader}>
        <Text style={styles.statTitle}>{title}</Text>
        <Ionicons name={icon} size={20} color="rgba(255,255,255,0.8)" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </LinearGradient>
  )

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.welcomeTitle}>Resumen de Auditoría</Text>

      <View style={styles.statsGrid}>
        <StatCard
          title="Instituciones"
          value={stats.total_instituciones}
          icon="business"
          colors={['#3B82F6', '#2563EB']}
          subtitle="Total registradas"
        />
        <StatCard
          title="Visitas"
          value={stats.total_visitas}
          icon="clipboard"
          colors={['#10B981', '#059669']}
          subtitle="Auditorías realizadas"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendientes_sinc}
          icon="cloud-upload"
          colors={['#F59E0B', '#D97706']}
          subtitle="Por sincronizar"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información de Sincronización</Text>
        <View style={styles.infoRow}>
          <Ionicons name="wifi" size={20} color="#4F46E5" />
          <Text style={styles.infoText}>
            El sistema está diseñado para trabajar sin conexión. Tus cambios se enviarán a Railway automáticamente cuando detecte señal.
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color="#4F46E5" />
          <Text style={styles.infoText}>
            Última actualización local: {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 24, marginTop: 12 },
  statsGrid: { gap: 16, marginBottom: 24 },
  statCard: {
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600' },
  statValue: { color: 'white', fontSize: 36, fontWeight: 'bold' },
  statSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  infoText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#4B5563', lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
})
