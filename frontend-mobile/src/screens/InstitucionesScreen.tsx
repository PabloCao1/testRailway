import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import apiClient from '../services/apiClient'
import { getDB } from '../database/db'

export const InstitucionesScreen = ({ navigation }: any) => {
  const [instituciones, setInstituciones] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchInstituciones()
  }, [search])

  const fetchInstituciones = async () => {
    try {
      if (!refreshing) setLoading(true)

      // Intentar traer de la API directamente (Railway es prioridad)
      const response = await apiClient.get('auditoria/instituciones/', {
        params: { search: search || undefined }
      })

      const data = response.data.results || response.data
      setInstituciones(data)

      // Actualizar cache local silenciosamente
      const db = getDB()
      for (const inst of data) {
        await db.runAsync(
          `INSERT OR REPLACE INTO instituciones (server_id, nombre, tipo, direccion, barrio, comuna, pending_sync)
           VALUES (?, ?, ?, ?, ?, ?, 0)`,
          [inst.id, inst.nombre, inst.tipo, inst.direccion, inst.barrio, inst.comuna]
        )
      }
    } catch (error) {
      console.log('📡 Offline o Error API, cargando cache local...')
      try {
        const db = getDB()
        let query = 'SELECT * FROM instituciones'
        let params: any[] = []
        if (search) {
          query += ' WHERE nombre LIKE ? OR tipo LIKE ? OR barrio LIKE ?'
          params = [`%${search}%`, `%${search}%`, `%${search}%`]
        }
        query += ' ORDER BY nombre ASC'
        const localData = await db.getAllAsync<any>(query, params)
        setInstituciones(localData)
      } catch (dbError) {
        console.error('Error cargando cache:', dbError)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchInstituciones()
  }

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      escuela: 'school', cdi: 'business', hogar: 'home', geriatrico: 'medical', otro: 'cube'
    }
    return icons[tipo?.toLowerCase()] || 'cube'
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar instituciones..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={instituciones}
          keyExtractor={(item) => (item.id || item.server_id).toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('InstitucionDetalle', {
                id: item.id || item.server_id,
                nombre: item.nombre // Opcional para mostrar rápido el título
              })}
              activeOpacity={0.7}
            >
              <View style={styles.iconBox}>
                <Ionicons name={getTipoIcon(item.tipo) as any} size={24} color="#3B82F6" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.title}>{item.nombre}</Text>
                <Text style={styles.subtitle}>{item.tipo?.toUpperCase()}</Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.locationText}>{item.direccion || 'Sin dirección'}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No se encontraron instituciones.</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827' },
  listContent: { padding: 16, paddingTop: 0 },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 11, fontWeight: 'bold', color: '#3B82F6', marginTop: 2, letterSpacing: 0.5 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  locationText: { fontSize: 13, color: '#6B7280', marginLeft: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { color: '#9CA3AF', marginTop: 16, fontSize: 16, textAlign: 'center' },
})
