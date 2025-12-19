import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import apiClient from '../services/apiClient'
import { getDB } from '../database/db'

export const VisitasScreen = ({ navigation }: any) => {
  const [visitas, setVisitas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchVisitas()
  }, [])

  const fetchVisitas = async () => {
    try {
      if (!refreshing) setLoading(true)

      const response = await apiClient.get('auditoria/visitas/')
      const data = response.data.results || response.data
      setVisitas(data)

      // Cache local
      const db = getDB()
      for (const v of data) {
        await db.runAsync(
          `INSERT OR REPLACE INTO visitas (id, server_id, institucion_id, fecha, tipo_comida, observaciones, formulario_completado, synced)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [v.id.toString(), v.id, v.institucion, v.fecha, v.tipo_comida, v.observaciones, v.formulario_completado ? 1 : 0]
        )
      }
    } catch (error) {
      console.log('📡 Offline o Error API Visitas, cargando local...')
      try {
        const db = getDB()
        const localData = await db.getAllAsync<any>(`
          SELECT v.*, i.nombre as institucion_nombre 
          FROM visitas v 
          LEFT JOIN instituciones i ON v.institucion_id = i.server_id 
          ORDER BY v.fecha DESC
        `)
        setVisitas(localData)
      } catch (dbError) {
        console.error('Error cache visitas:', dbError)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchVisitas()
  }

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={visitas}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('VisitaDetalle', { id: item.id })}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="clipboard-outline" size={24} color="#3B82F6" />
                <View style={styles.headerText}>
                  <Text style={styles.title}>{item.institucion_nombre || `Institución #${item.institucion}`}</Text>
                  <Text style={styles.date}>{new Date(item.fecha).toLocaleDateString('es-AR')}</Text>
                </View>
              </View>
              <View style={styles.details}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.tipo_comida?.toUpperCase()}</Text>
                </View>
                {item.observaciones && (
                  <Text style={styles.obs} numberOfLines={2}>{item.observaciones}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16 },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerText: { marginLeft: 12 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  date: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  details: { flex: 1, alignItems: 'flex-end', marginRight: 12 },
  tag: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, color: '#3B82F6', fontWeight: 'bold' },
  obs: { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'right' },
})
