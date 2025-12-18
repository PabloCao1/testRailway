import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { reportesService } from '../services/reportesService'

export const ReporteInstitucionScreen = ({ route }: any) => {
  const { id } = route.params
  const [reporte, setReporte] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReporte()
  }, [id])

  const loadReporte = async () => {
    try {
      setLoading(true)
      const data = await reportesService.getReporteInstitucion(id)
      setReporte(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    )
  }

  if (!reporte) {
    return (
      <View style={styles.loading}>
        <Text>No se pudo cargar el reporte</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Reporte Nutricional</Text>
        <Text style={styles.subtitle}>{reporte.institucion.nombre}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas Generales</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{reporte.total_visitas}</Text>
            <Text style={styles.statLabel}>Visitas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{reporte.total_platos}</Text>
            <Text style={styles.statLabel}>Platos</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Promedios Nutricionales</Text>
        <View style={styles.nutriCard}>
          <View style={styles.nutriRow}>
            <Text style={styles.nutriLabel}>⚡ Energía</Text>
            <Text style={styles.nutriValue}>{reporte.promedios_nutricionales.energia_promedio?.toFixed(1) || 0} kcal</Text>
          </View>
          <View style={styles.nutriRow}>
            <Text style={styles.nutriLabel}>🥩 Proteínas</Text>
            <Text style={styles.nutriValue}>{reporte.promedios_nutricionales.proteinas_promedio?.toFixed(1) || 0} g</Text>
          </View>
          <View style={styles.nutriRow}>
            <Text style={styles.nutriLabel}>🧈 Grasas</Text>
            <Text style={styles.nutriValue}>{reporte.promedios_nutricionales.grasas_promedio?.toFixed(1) || 0} g</Text>
          </View>
          <View style={styles.nutriRow}>
            <Text style={styles.nutriLabel}>🌾 Carbohidratos</Text>
            <Text style={styles.nutriValue}>{reporte.promedios_nutricionales.carbohidratos_promedio?.toFixed(1) || 0} g</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visitas por Tipo de Comida</Text>
        {reporte.visitas_por_tipo_comida.map((item: any, index: number) => (
          <View key={index} style={styles.tipoCard}>
            <Text style={styles.tipoLabel}>{item.tipo_comida}</Text>
            <Text style={styles.tipoCount}>{item.count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#8B5CF6', padding: 24, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 16, color: '#EDE9FE', marginTop: 4 },
  section: { margin: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#111827' },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: '#8B5CF6' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  nutriCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  nutriRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  nutriLabel: { fontSize: 14, color: '#374151' },
  nutriValue: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  tipoCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  tipoLabel: { fontSize: 14, color: '#374151', textTransform: 'capitalize' },
  tipoCount: { fontSize: 18, fontWeight: 'bold', color: '#8B5CF6' },
})
