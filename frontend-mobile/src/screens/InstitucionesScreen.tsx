import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native'
import { auditoriaService, Institucion } from '../services/auditoriaService'

export const InstitucionesScreen = ({ navigation }: any) => {
  const [instituciones, setInstituciones] = useState<Institucion[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadInstituciones()
  }, [search])

  const loadInstituciones = async () => {
    try {
      const data = await auditoriaService.getInstituciones({ search })
      setInstituciones(data.results)
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las instituciones')
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar instituciones..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={instituciones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('InstitucionDetalle', { id: item.id })}
          >
            <Text style={styles.title}>{item.nombre}</Text>
            <Text style={styles.subtitle}>{item.codigo} - {item.tipo}</Text>
            {item.direccion && <Text style={styles.text}>{item.direccion}</Text>}
            {item.barrio && <Text style={styles.text}>Barrio: {item.barrio}</Text>}
            <Text style={styles.viewDetail}>Ver detalle →</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 8 },
  text: { fontSize: 14, color: '#444' },
  viewDetail: { fontSize: 12, color: '#4F46E5', fontWeight: 'bold', marginTop: 8 },
})
