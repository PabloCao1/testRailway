import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import { reportesService, DashboardStats } from '../services/reportesService'

export const DashboardScreen = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await reportesService.getDashboardStats()
      setStats(data)
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las estadísticas')
    }
  }

  if (!stats) return <View style={styles.container}><Text>Cargando...</Text></View>

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
          <Text style={styles.statValue}>{stats.total_instituciones}</Text>
          <Text style={styles.statLabel}>Instituciones</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
          <Text style={styles.statValue}>{stats.total_visitas}</Text>
          <Text style={styles.statLabel}>Visitas</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f3e5f5' }]}>
          <Text style={styles.statValue}>{stats.total_platos}</Text>
          <Text style={styles.statLabel}>Platos</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Visitas por Tipo de Comida</Text>
        {stats.visitas_por_tipo.map((item) => (
          <View key={item.tipo_comida} style={styles.row}>
            <Text style={styles.rowLabel}>{item.tipo_comida}</Text>
            <Text style={styles.rowValue}>{item.count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLabel: { fontSize: 14, color: '#444', textTransform: 'capitalize' },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#1976d2' },
})
