import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { auditoriaService, VisitaAuditoria } from '../services/auditoriaService'

export const VisitasScreen = ({ navigation }: any) => {
  const [visitas, setVisitas] = useState<VisitaAuditoria[]>([])

  useEffect(() => {
    loadVisitas()
  }, [])

  const loadVisitas = async () => {
    try {
      const data = await auditoriaService.getVisitas()
      setVisitas(data.results)
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las visitas')
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visitas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VisitaDetalle', { id: item.id })}
          >
            <Text style={styles.title}>{item.institucion_nombre}</Text>
            <Text style={styles.subtitle}>{item.fecha} - {item.tipo_comida}</Text>
            {item.observaciones && <Text style={styles.text}>{item.observaciones}</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
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
})
