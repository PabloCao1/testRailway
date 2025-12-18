import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { auditoriaService } from '../services/auditoriaService'

export const VisitaDetalleScreen = ({ route, navigation }: any) => {
  const { id } = route.params
  const [visita, setVisita] = useState<any>(null)

  useEffect(() => {
    loadVisita()
  }, [id])

  const loadVisita = async () => {
    try {
      const data = await auditoriaService.getVisita(id)
      setVisita(data)
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la visita')
    }
  }

  if (!visita) return <View style={styles.container}><Text>Cargando...</Text></View>

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{visita.institucion_nombre}</Text>
        <Text style={styles.subtitle}>{visita.fecha} - {visita.tipo_comida}</Text>
        <TouchableOpacity 
          style={styles.formularioButton}
          onPress={() => navigation.navigate('FormularioRelevamiento', { visitaId: id })}
        >
          <Text style={styles.formularioButtonText}>📋 Completar Formulario</Text>
        </TouchableOpacity>
      </View>

      {visita.platos?.map((plato: any) => (
        <View key={plato.id} style={styles.platoCard}>
          <Text style={styles.platoTitle}>{plato.nombre}</Text>
          {plato.tipo_plato && <Text style={styles.text}>Tipo: {plato.tipo_plato}</Text>}
          
          {plato.ingredientes && plato.ingredientes.length > 0 && (
            <View style={styles.ingredientes}>
              <Text style={styles.sectionTitle}>Ingredientes:</Text>
              {plato.ingredientes.map((ing: any) => (
                <Text key={ing.id} style={styles.ingrediente}>
                  • {ing.alimento_nombre} - {ing.cantidad}{ing.unidad}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.totales}>
            <Text style={styles.sectionTitle}>Totales Nutricionales:</Text>
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Energía:</Text>
              <Text style={styles.nutrientValue}>{plato.energia_kcal_total?.toFixed(1) || 0} kcal</Text>
            </View>
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Proteínas:</Text>
              <Text style={styles.nutrientValue}>{plato.proteinas_g_total?.toFixed(1) || 0} g</Text>
            </View>
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Grasas:</Text>
              <Text style={styles.nutrientValue}>{plato.grasas_totales_g_total?.toFixed(1) || 0} g</Text>
            </View>
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Carbohidratos:</Text>
              <Text style={styles.nutrientValue}>{plato.carbohidratos_g_total?.toFixed(1) || 0} g</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: 'white', padding: 16, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666' },
  platoCard: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  platoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  text: { fontSize: 14, color: '#444', marginBottom: 4 },
  ingredientes: { marginTop: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  ingrediente: { fontSize: 14, color: '#444', marginLeft: 8, marginBottom: 4 },
  totales: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  nutrientRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  nutrientLabel: { fontSize: 14, color: '#444' },
  nutrientValue: { fontSize: 14, fontWeight: '600', color: '#1976d2' },
  formularioButton: { backgroundColor: '#10B981', padding: 12, borderRadius: 8, marginTop: 12, alignItems: 'center' },
  formularioButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
})
