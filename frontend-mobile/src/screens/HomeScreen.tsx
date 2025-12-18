import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useAuthStore } from '../store/authStore'

export function HomeScreen() {
  const user = useAuthStore((state) => state.user)

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>
          Bienvenido, {user?.first_name || user?.username || 'Usuario'}
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Panel de control principal del sistema de auditoría
        </Text>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Métricas Generales</Text>
          <Text style={styles.metricSubtitle}>Resumen de actividades del sistema</Text>
          <Text style={styles.metricValue}>--</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Auditorías Activas</Text>
          <Text style={styles.metricSubtitle}>Procesos en curso</Text>
          <Text style={[styles.metricValue, { color: '#10b981' }]}>--</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Reportes Pendientes</Text>
          <Text style={styles.metricSubtitle}>Documentos por revisar</Text>
          <Text style={[styles.metricValue, { color: '#f59e0b' }]}>--</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  welcome: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 16,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  metricsContainer: {
    paddingHorizontal: 16,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
})