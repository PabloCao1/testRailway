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
import { Q } from '@nozbe/watermelondb'
import { database } from '../database'
import syncService from '../database/sync/syncService'

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
      const visita = await findVisitaRecord()
      if (!visita) {
        Alert.alert(
          'Sin datos locales',
          'No encontramos esta visita en el almacenamiento offline. Intenta sincronizar y vuelve a abrir el formulario.',
          [{ text: 'Aceptar', onPress: () => navigation.goBack() }],
        )
        return
      }

      setLocalVisitaId(visita.id)
      setFormData(visita.formularioRespuestas || {})
    } catch (error) {
      console.error('Error cargando formulario:', error)
      Alert.alert('Error', 'No pudimos cargar la visita desde la base local.')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const findVisitaRecord = async () => {
    const collection = database.get('visitas')

    if (typeof visitaId === 'string') {
      try {
        return await collection.find(visitaId)
      } catch (error) {
        // Si no existe con el ID local seguimos buscando por server_id
      }
    }

    const numericId = Number(visitaId)
    if (!Number.isNaN(numericId)) {
      const existing = await collection.query(Q.where('server_id', numericId)).fetch()
      if (existing.length > 0) {
        return existing[0]
      }
    }

    return null
  }

  const saveFormData = async () => {
    if (!localVisitaId) {
      Alert.alert('Sin visita local', 'No pudimos identificar la visita. Intenta sincronizar antes de guardar.')
      return
    }

    setIsSaving(true)
    try {
      await database.write(async () => {
        const visita = await database.get('visitas').find(localVisitaId)
        await visita.update((record: any) => {
          record.formularioRespuestas = formData
          record.formularioCompletado = true
          record.synced = false
        })
      })

      Alert.alert(
        'Exito',
        'Formulario guardado en el dispositivo. Se enviara automaticamente cuando vuelva la conexion.',
      )
      navigation.goBack()
      await syncService.syncIfNeeded()
    } catch (error) {
      console.error('Error guardando formulario:', error)
      Alert.alert('Error', 'No pudimos guardar el formulario en la base local.')
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
        <TouchableOpacity
          style={[styles.booleanButton, formData[section]?.[field] === true && styles.booleanButtonActive]}
          onPress={() => updateField(section, field, true)}
        >
          <Text style={styles.booleanButtonText}>Si</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.booleanButton, formData[section]?.[field] === false && styles.booleanButtonActive]}
          onPress={() => updateField(section, field, false)}
        >
          <Text style={styles.booleanButtonText}>No</Text>
        </TouchableOpacity>
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
      />
    </View>
  )

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Cargando datos locales...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>dY"< Formulario de Relevamiento</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Prestacion del Servicio</Text>
        {renderBooleanField('prestacion', 'servicio_funcionando', 'El servicio esta funcionando?')}
        {renderTextField('prestacion', 'observaciones', 'Observaciones')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Cantidad de Raciones</Text>
        {renderTextField('raciones', 'cantidad_programada', 'Cantidad programada')}
        {renderTextField('raciones', 'cantidad_servida', 'Cantidad servida')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Control de Temperaturas</Text>
        {renderBooleanField('temperaturas', 'control_realizado', 'Se realiza control de temperatura?')}
        {renderTextField('temperaturas', 'temperatura_frio', 'Temperatura frio (C)')}
        {renderTextField('temperaturas', 'temperatura_caliente', 'Temperatura caliente (C)')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Personal</Text>
        {renderTextField('personal', 'cantidad', 'Cantidad de personal')}
        {renderBooleanField('personal', 'capacitacion', 'Personal capacitado?')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Habitos Higienicos</Text>
        {renderBooleanField('higiene', 'lavado_manos', 'Se lavan las manos?')}
        {renderBooleanField('higiene', 'uso_cofia', 'Usan cofia?')}
        {renderBooleanField('higiene', 'uso_barbijo', 'Usan barbijo?')}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.buttonDisabled]}
          onPress={saveFormData}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Guardando...' : "dY'_ Guardar Formulario"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#374151' },
  header: { backgroundColor: '#4F46E5', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#111827' },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' },
  booleanButtons: { flexDirection: 'row', gap: 12 },
  booleanButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  booleanButtonActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  booleanButtonText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: { padding: 16, gap: 12 },
  saveButton: { backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#6B7280', padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
})
