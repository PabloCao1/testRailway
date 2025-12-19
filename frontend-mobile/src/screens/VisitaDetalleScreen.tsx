import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { getDB } from '../database/db'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export const VisitaDetalleScreen = ({ route, navigation }: any) => {
  const { id } = route.params
  const [visita, setVisita] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVisita()
  }, [id])

  const loadVisita = async () => {
    try {
      setLoading(true)
      const db = getDB()

      // Load visit with institution name
      const data = await db.getFirstAsync<any>(`
        SELECT v.*, i.nombre as institucion_nombre 
        FROM visitas v 
        LEFT JOIN instituciones i ON v.institucion_id = i.server_id 
        WHERE v.id = ?
      `, [id])

      if (!data) {
        Alert.alert('Error', 'Visita no encontrada localmente')
        navigation.goBack()
        return
      }

      // In a real local-first app, we'd also load local platos/ingredientes if they existed
      // For now, we'll show what we have in the visitas table (formulario_respuestas)
      setVisita(data)
    } catch (error) {
      console.error('Error loading visita:', error)
      Alert.alert('Error', 'Error al cargar la visita')
    } finally {
      setLoading(false)
    }
  }

  const getTipoComidaIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      desayuno: 'cafe', almuerzo: 'restaurant', merienda: 'ice-cream', cena: 'moon'
    }
    return icons[tipo?.toLowerCase()] || 'clipboard'
  }

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  )

  if (!visita) return null

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Visita</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.iconBox}>
            <Ionicons name={getTipoComidaIcon(visita.tipo_comida) as any} size={32} color="#4F46E5" />
          </View>
          <Text style={styles.institucionName}>{visita.institucion_nombre}</Text>
          <Text style={styles.visitaMeta}>
            {visita.tipo_comida?.toUpperCase()} • {new Date(visita.fecha).toLocaleDateString()}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.mainAction}
          onPress={() => navigation.navigate('FormularioRelevamiento', { visitaId: id })}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.actionGradient}
          >
            <Ionicons name="list" size={24} color="white" />
            <Text style={styles.actionText}>Continuar Formulario</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Observaciones</Text>
          <Text style={styles.obsText}>
            {visita.observaciones || 'Sin observaciones registradas.'}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Completado</Text>
              <Text style={[styles.infoValue, { color: visita.formulario_completado ? '#10B981' : '#F59E0B' }]}>
                {visita.formulario_completado ? 'SÍ' : 'PENDIENTE'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Estado Sinc</Text>
              <Text style={[styles.infoValue, { color: visita.synced ? '#3B82F6' : '#EF4444' }]}>
                {visita.synced ? 'Sincronizado' : 'Local'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.infoBoxText}>
            Toda la información editada en el formulario se guardará automáticamente en este dispositivo.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 48,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  headerContent: { alignItems: 'center', marginTop: 24 },
  iconBox: {
    width: 64,
    height: 64,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  institucionName: { fontSize: 22, fontWeight: 'bold', color: 'white', textAlign: 'center', paddingHorizontal: 24 },
  visitaMeta: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, letterSpacing: 0.5 },
  content: { padding: 24 },
  mainAction: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  actionText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 12 },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#374151', marginBottom: 12 },
  obsText: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: 'bold' },
  infoBox: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBoxText: {
    marginLeft: 12,
    fontSize: 13,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 18,
  },
})
