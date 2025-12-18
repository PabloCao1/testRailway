import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { auditoriaService, Institucion, VisitaAuditoria } from '../services/auditoriaService'

export const InstitucionDetalleScreen = ({ route, navigation }: any) => {
  const { id } = route.params
  const [institucion, setInstitucion] = useState<Institucion | null>(null)
  const [visitas, setVisitas] = useState<VisitaAuditoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [instData, visitasData] = await Promise.all([
        auditoriaService.getInstitucion(id),
        auditoriaService.getVisitas({ institucion: id })
      ])
      setInstitucion(instData)
      setVisitas(visitasData.results)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      escuela: '🏫', cdi: '🏬', hogar: '🏠', geriatrico: '🏛️', otro: '🏭'
    }
    return icons[tipo] || '🏭'
  }

  const getTipoComidaIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      desayuno: '☕', almuerzo: '🍽️', merienda: '🧁', cena: '🌙', vianda: '📦'
    }
    return icons[tipo] || '🍴'
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    )
  }

  if (!institucion) {
    return (
      <View style={styles.loading}>
        <Text>Institución no encontrada</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>{getTipoIcon(institucion.tipo)}</Text>
        <Text style={styles.headerTitle}>{institucion.nombre}</Text>
        <Text style={styles.headerSubtitle}>#{institucion.codigo}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Ubicación</Text>
          <Text style={styles.statValue}>{institucion.direccion || 'N/A'}</Text>
          {institucion.barrio && <Text style={styles.statBadge}>🏘️ {institucion.barrio}</Text>}
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Visitas</Text>
          <Text style={styles.statNumber}>{visitas.length}</Text>
        </View>
      </View>

      {/* Visitas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Historial de Auditorías</Text>
        {visitas.length === 0 ? (
          <Text style={styles.emptyText}>No hay visitas registradas</Text>
        ) : (
          visitas.map((visita) => (
            <TouchableOpacity
              key={visita.id}
              style={styles.visitaCard}
              onPress={() => navigation.navigate('VisitaDetalle', { id: visita.id })}
            >
              <View style={styles.visitaHeader}>
                <Text style={styles.visitaIcon}>{getTipoComidaIcon(visita.tipo_comida)}</Text>
                <View style={styles.visitaInfo}>
                  <Text style={styles.visitaTipo}>{visita.tipo_comida}</Text>
                  <Text style={styles.visitaFecha}>{new Date(visita.fecha).toLocaleDateString('es-AR')}</Text>
                </View>
              </View>
              {visita.observaciones && (
                <Text style={styles.visitaObs}>{visita.observaciones}</Text>
              )}
              <Text style={styles.visitaBadge}>{visita.platos?.length || 0} platos</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#4F46E5', padding: 24, alignItems: 'center' },
  headerIcon: { fontSize: 48, marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: '#E0E7FF', marginTop: 4 },
  statsContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  statValue: { fontSize: 14, color: '#111827' },
  statBadge: { fontSize: 12, color: '#4F46E5', marginTop: 4 },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: '#10B981' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  emptyText: { textAlign: 'center', color: '#6B7280', padding: 32 },
  visitaCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  visitaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  visitaIcon: { fontSize: 32, marginRight: 12 },
  visitaInfo: { flex: 1 },
  visitaTipo: { fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize' },
  visitaFecha: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  visitaObs: { fontSize: 14, color: '#374151', marginBottom: 8 },
  visitaBadge: { fontSize: 12, color: '#4F46E5', fontWeight: '600' },
})
