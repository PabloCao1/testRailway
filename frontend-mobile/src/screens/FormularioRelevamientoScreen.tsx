import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { getDB } from '../database/db'
import syncService from '../services/syncService'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export const FormularioRelevamientoScreen = ({ route, navigation }: any) => {
  const { visitaId } = route.params
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [localVisitaId, setLocalVisitaId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadFormData()
  }, [visitaId])

  const loadFormData = async () => {
    try {
      setLoading(true)
      const db = getDB()

      // Buscar visita en cache local
      let visita: any = await db.getFirstAsync('SELECT * FROM visitas WHERE id = ? OR server_id = ?', [visitaId, visitaId])

      if (!visita) {
        Alert.alert('Error', 'No se encontró la visita localmente. Asegúrate de haberla visto en la lista antes.')
        navigation.goBack()
        return
      }

      setLocalVisitaId(visita.id)
      const parsedFormData = visita.formulario_respuestas ? JSON.parse(visita.formulario_respuestas) : {}
      setFormData(parsedFormData)
    } catch (error) {
      console.error('Error cargando formulario:', error)
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  /**
   * ARQUITECTURA SENIOR: Registro Local -> Background Sync
   */
  const handleSaveFlow = async () => {
    if (!localVisitaId) return
    setIsSaving(true)

    try {
      const db = getDB()
      const formDataJson = JSON.stringify(formData)
      const now = new Date().toISOString()

      // 1. Persistencia Local Inmediata (SQLite)
      // Usamos synced = 0 (pending_sync) y updated_at para resolución de conflictos
      await db.runAsync(
        'UPDATE visitas SET formulario_respuestas = ?, formulario_completado = 1, pending_sync = 1, updated_at = ? WHERE id = ?',
        [formDataJson, now, localVisitaId]
      )

      console.log('💾 [Offline-First] Datos persistidos en SQLite local.')

      Alert.alert(
        'Formulario Guardado',
        'Se ha registrado localmente. La sincronización con el servidor se realizará en segundo plano.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      )

      // 2. Disparo de Sincronización Silenciosa
      // No esperamos (await) para no bloquear el retorno a la pantalla anterior
      syncService.syncIfNeeded()

    } catch (error) {
      console.error('❌ Error en persistencia local:', error)
      Alert.alert('Error', 'No se pudo guardar el formulario localmente.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (section: string, field: string, value: any) => {
    setFormData({
      ...formData,
      [section]: { ...formData[section], [field]: value },
    })
  }

  const renderBooleanField = (section: string, field: string, label: string) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.booleanButtons}>
        {[
          { label: 'Sí', val: true, color: '#10B981' },
          { label: 'No', val: false, color: '#EF4444' }
        ].map((opt) => (
          <TouchableOpacity
            key={opt.label}
            style={[
              styles.booleanButton,
              formData[section]?.[field] === opt.val && { backgroundColor: opt.color, borderColor: opt.color }
            ]}
            onPress={() => updateField(section, field, opt.val)}
          >
            <Text style={[styles.booleanButtonText, formData[section]?.[field] === opt.val && { color: 'white' }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderTextField = (section: string, field: string, label: string) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={formData[section]?.[field] || ''}
        onChangeText={(value) => updateField(section, field, value)}
        multiline
        placeholder="Escribe aquí..."
      />
    </View>
  )

  if (loading) return (
    <View style={styles.loadingCenter}>
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  )

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
        <Text style={styles.headerTitle}>Relevamiento</Text>
        <Text style={styles.headerSubtitle}>Complete los datos de la auditoría</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>1. Prestación del Servicio</Text>
          </View>
          {renderBooleanField('prestacion', 'servicio_funcionando', '¿El servicio está funcionando?')}
          {renderTextField('prestacion', 'serv_obs', 'Observaciones generales')}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>2. Cantidad de Raciones</Text>
          </View>
          {renderTextField('raciones', 'cant_prog', 'Cantidad programada')}
          {renderTextField('raciones', 'cant_serv', 'Cantidad servida')}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="thermometer" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>3. Temperaturas</Text>
          </View>
          {renderBooleanField('temperaturas', 'ctrl_temp', '¿Se realiza control?')}
          {renderTextField('temperaturas', 'temp_frio', 'Temperatura Frío (°C)')}
          {renderTextField('temperaturas', 'temp_caliente', 'Temperatura Caliente (°C)')}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
          onPress={handleSaveFlow}
          disabled={isSaving}
        >
          <LinearGradient colors={['#10B981', '#059669']} style={styles.btnGradient}>
            <Text style={styles.saveBtnText}>{isSaving ? 'GUARDANDO...' : 'FINALIZAR RELEVAMIENTO'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 32, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  scrollContent: { padding: 20 },
  section: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  field: { marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },
  booleanButtons: { flexDirection: 'row', gap: 12 },
  booleanButton: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  booleanButtonText: { fontSize: 15, fontWeight: 'bold', color: '#6B7280' },
  textInput: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 15, fontSize: 15, color: '#1F2937', minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
  btnGradient: { height: 60, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
})
