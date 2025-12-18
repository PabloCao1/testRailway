import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, Modal } from 'react-native'
import { nutricionService, CategoriaAlimento } from '../services/nutricionService'

export const CategoriasScreen = () => {
  const [categorias, setCategorias] = useState<CategoriaAlimento[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ codigo: '', nombre: '', descripcion: '' })

  useEffect(() => {
    loadCategorias()
  }, [])

  const loadCategorias = async () => {
    try {
      setLoading(true)
      const data = await nutricionService.getCategorias()
      setCategorias(data.results)
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las categorías')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await nutricionService.updateCategoria(editingId, formData)
      } else {
        await nutricionService.createCategoria(formData)
      }
      setModalVisible(false)
      resetForm()
      loadCategorias()
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la categoría')
    }
  }

  const handleEdit = (cat: CategoriaAlimento) => {
    setEditingId(cat.id)
    setFormData({ codigo: cat.codigo, nombre: cat.nombre, descripcion: cat.descripcion || '' })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    Alert.alert('Confirmar', '¿Eliminar esta categoría?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await nutricionService.deleteCategoria(id)
            loadCategorias()
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar')
          }
        }
      }
    ])
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({ codigo: '', nombre: '', descripcion: '' })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📂 Categorías de Alimentos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setModalVisible(true) }}>
          <Text style={styles.addButtonText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text style={styles.cardSubtitle}>Código: {item.codigo}</Text>
              {item.descripcion && <Text style={styles.cardDesc}>{item.descripcion}</Text>}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                <Text style={styles.editButtonText}>✏️</Text>
              </TouchableOpacity>
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
            <Text style={styles.modalTitle}>{editingId ? 'Editar' : 'Nueva'} Categoría</Text>
            <TextInput
              style={styles.input}
              placeholder="Código"
              value={formData.codigo}
              onChangeText={(codigo) => setFormData({ ...formData, codigo })}
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={formData.nombre}
              onChangeText={(nombre) => setFormData({ ...formData, nombre })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción"
              value={formData.descripcion}
              onChangeText={(descripcion) => setFormData({ ...formData, descripcion })}
              multiline
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
  header: { backgroundColor: '#4F46E5', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  addButton: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#4F46E5', fontWeight: 'bold' },
  card: { backgroundColor: 'white', margin: 12, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#374151' },
  cardActions: { flexDirection: 'row', gap: 8 },
  editButton: { padding: 8 },
  editButtonText: { fontSize: 20 },
  deleteButton: { padding: 8 },
  deleteButtonText: { fontSize: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelButton: { flex: 1, backgroundColor: '#6B7280', padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: 'white', fontWeight: 'bold' },
  saveButton: { flex: 1, backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
})
