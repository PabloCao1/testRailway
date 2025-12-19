import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import apiClient from '../services/apiClient'
import { getDB } from '../database/db'
import { LinearGradient } from 'expo-linear-gradient'

export const InstitucionDetalleScreen = ({ route, navigation }: any) => {
  const { id } = route.params
  const [institucion, setInstitucion] = useState<any>(null)
  const [visitas, setVisitas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true)

      const instResponse = await apiClient.get(`auditoria/instituciones/${id}/`)
      const instData = instResponse.data
      setInstitucion(instData)

      const visitasResponse = await apiClient.get(`auditoria/visitas/`, {
        params: { institucion: id }
      })
      const visitasData = visitasResponse.data.results || visitasResponse.data
      setVisitas(visitasData)

      // Sync local cache
      const db = getDB()
      await db.runAsync(
        `INSERT OR REPLACE INTO instituciones (server_id, nombre, tipo, direccion, barrio, comuna, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [instData.id, instData.nombre, instData.tipo, instData.direccion, instData.barrio, instData.comuna, instData.updated_at]
      )

      // Sync local visits
      for (const v of visitasData) {
        await db.runAsync(
          `INSERT OR REPLACE INTO visitas (id, server_id, institucion_id, fecha, tipo_comida, observaciones, formulario_respuestas, formulario_completado, pending_sync, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
          [`remote-${v.id}`, v.id, v.institucion, v.fecha, v.tipo_comida, v.observaciones, JSON.stringify(v.formulario_respuestas), v.formulario_completado ? 1 : 0, v.updated_at]
        )
      }

    } catch (error) {
      console.log('📡 Offline: Cargando desde cache local.')
      try {
        const db = getDB()
        const localInst = await db.getFirstAsync<any>(
          'SELECT * FROM instituciones WHERE server_id = ? OR id = ?',
          [id, id]
        )
        if (localInst) {
          setInstitucion(localInst)
          const localVisitas = await db.getAllAsync<any>(
            'SELECT * FROM visitas WHERE institucion_id = ? ORDER BY fecha DESC',
            [localInst.server_id]
          )
          setVisitas(localVisitas)
        }
      } catch (dbError) {
        console.error('Error DB:', dbError)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const createLocalVisit = async () => {
    try {
      const db = getDB()
      const localId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const now = new Date().toISOString()
      const today = now.split('T')[0]

      await db.runAsync(
        `INSERT INTO visitas (id, institucion_id, fecha, tipo_comida, pending_sync, created_at, updated_at) 
         VALUES (?, ?, ?, ?, 1, ?, ?)`,
        [localId, institucion.server_id, today, 'almuerzo', now, now]
      )

      navigation.navigate('FormularioRelevamiento', { visitaId: localId })
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la visita localmente.')
    }
  }

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      escuela: 'school', cdi: 'business', hogar: 'home', geriatrico: 'medical', otro: 'cube'
    }
    return icons[tipo?.toLowerCase()] || 'cube'
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    )
  }

  if (!institucion) return null

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={['#3B82F6']} />}
      >
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.iconCircle}>
              <Ionicons name={getTipoIcon(institucion.tipo) as any} size={40} color="white" />
            </View>
            <View style={styles.headerRight} />
          </View>
          <Text style={styles.headerTitle}>{institucion.nombre}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{institucion.tipo?.toUpperCase()}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>{institucion.direccion || 'Sin dirección'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="map" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>{institucion.barrio || 'Sin barrio'} - Comuna {institucion.comuna || '-'}</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historial de Auditorías</Text>
            <TouchableOpacity style={styles.addBtn} onPress={createLocalVisit}>
              <Ionicons name="add-circle" size={24} color="#3B82F6" />
              <Text style={styles.addBtnText}>NUEVA</Text>
            </TouchableOpacity>
          </View>

          {visitas.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="clipboard-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No hay visitas registradas.</Text>
            </View>
          ) : (
            visitas.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={styles.visitaCard}
                onPress={() => navigation.navigate('FormularioRelevamiento', { visitaId: v.id })}
              >
                <View style={[styles.statusIndicator, v.pending_sync === 0 ? styles.statusSynced : styles.statusPending]} />
                <View style={styles.visitaInfo}>
                  <Text style={styles.visitaType}>{v.tipo_comida?.toUpperCase()}</Text>
                  <Text style={styles.visitaDate}>{new Date(v.fecha).toLocaleDateString('es-AR')}</Text>
                </View>
                {v.pending_sync === 1 && (
                  <View style={styles.pendingBadge}>
                    <Ionicons name="cloud-upload-outline" size={14} color="#F59E0B" />
                    <Text style={styles.pendingText}>PENDIENTE</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 32, paddingTop: 48, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, alignItems: 'center' },
  headerTop: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerRight: { width: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 12 },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 10 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  content: { padding: 20 },
  infoCard: { backgroundColor: 'white', padding: 20, borderRadius: 24, elevation: 2, marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { marginLeft: 12, fontSize: 15, color: '#374151' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addBtnText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 14 },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#9CA3AF', marginTop: 12 },
  visitaCard: { backgroundColor: 'white', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 1 },
  statusIndicator: { width: 4, height: 40, borderRadius: 2, marginRight: 12 },
  statusSynced: { backgroundColor: '#10B981' },
  statusPending: { backgroundColor: '#F59E0B' },
  visitaInfo: { flex: 1 },
  visitaType: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  visitaDate: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 12 },
  pendingText: { fontSize: 10, fontWeight: 'bold', color: '#F59E0B' },
})
