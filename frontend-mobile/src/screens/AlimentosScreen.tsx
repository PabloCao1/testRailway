import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, Modal } from 'react-native'
import { nutricionService, AlimentoNutricional, CategoriaAlimento } from '../services/nutricionService'

export const AlimentosScreen = () => {
  const [alimentos, setAlimentos] = useState<AlimentoNutricional[]>([])
  const [categorias, setCategorias] = useState<CategoriaAlimento[]>([])
  const [search, setSearch] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    codigo_argenfood: '',
    nombre: '',
    categoria: 0,
    energia_kcal: '',
    proteinas_g: '',
    grasas_totales_g: '',
    carbohidratos_totales_g: ''
  })

  useEffect(() => {
    loadData()
  }, [search])

  const loadData = async () => {
    try {
      const [alimentosData, categoriasData] = await Promise.all([
        nutricionService.getAlimentos({ search }),
        nutricionService.getCategorias()
      ])
      setAlimentos(alimentosData.results)
      setCategorias(categoriasData.results)
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos')
    }
  }

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        categoria: Number(formData.categoria),
        energia_kcal: formData.energia_kcal ? Number(formData.energia_kcal) : undefined,
        proteinas_g: formData.proteinas_g ? Number(formData.proteinas_g) : undefined,
        grasas_totales_g: formData.grasas_totales_g ? Number(formData.grasas_totales_g) : undefined,
        carbohidratos_totales_g: formData.carbohidratos_totales_g ? Number(formData.carbohidratos_totales_g) : undefined,
      }
      
      if (editingId) {
        await nutricionService.updateAlimento(editingId, data)
      } else {
        await nutricionService.createAlimento(data)
      }
      setModalVisible(false)
      resetForm()
      loadData()
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el alimento')
    }
  }

  const handleDelete = async (id: number) => {
    Alert.alert('Confirmar', '¿Eliminar este alimento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await nutricionService.deleteAlimento(id)
            loadData()
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar')
          }
        }
      }
    ])
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      codigo_argenfood: '',
      nombre: '',
      categoria: 0,
      energia_kcal: '',
      proteinas_g: '',
      grasas_totales_g: '',
      carbohidratos_totales_g: ''
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🍎 Alimentos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setModalVisible(true) }}>
          <Text style={styles.addButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar alimentos..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={alimentos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text style={styles.cardSubtitle}>Código: {item.codigo_argenfood}</Text>
              <Text style={styles.cardInfo}>⚡ {item.energia_kcal || 0} kcal | 🥩 {item.proteinas_g || 0}g prot</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Editar' : 'Nuevo'} Alimento</Text>
            <TextInput
              style={styles.input}
              placeholder="Código Argenfood"
              value={formData.codigo_argenfood}
              onChangeText={(codigo_argenfood) => setFormData({ ...formData, codigo_argenfood })}
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={formData.nombre}
              onChangeText={(nombre) => setFormData({ ...formData, nombre })}
            />
            <TextInput
              style={styles.input}
              placeholder="Energía (kcal)"
              value={formData.energia_kcal}
              onChangeText={(energia_kcal) => setFormData({ ...formData, energia_kcal })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Proteínas (g)"
              value={formData.proteinas_g}
              onChangeText={(proteinas_g) => setFormData({ ...formData, proteinas_g })}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setModalVisible(false); resetForm() }}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: '#10B981', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  addButton: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#10B981', fontWeight: 'bold' },
  searchInput: { backgroundColor: 'white', margin: 12, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB' },
  card: { backgroundColor: 'white', marginHorizontal: 12, marginBottom: 12, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  cardInfo: { fontSize: 12, color: '#374151' },
  cardActions: { justifyContent: 'center' },
  deleteButton: { padding: 8 },
  deleteButtonText: { fontSize: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelButton: { flex: 1, backgroundColor: '#6B7280', padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: 'white', fontWeight: 'bold' },
  saveButton: { flex: 1, backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
})
