import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useAuthStore } from '../store/authStore'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

export function HomeScreen() {
  const user = useAuthStore((state) => state.user)
  const navigation = useNavigation<any>()

  const QuickAction = ({ icon, title, subtitle, color, onPress }: any) => (
    <TouchableOpacity
      style={[styles.actionCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.welcomeText}>¡Hola,</Text>
          <Text style={styles.userName}>{user?.first_name || user?.username || 'Usuario'}! 👋</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => useAuthStore.getState().logout()}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <QuickAction
          icon="business"
          title="Instituciones"
          subtitle="Gestionar establecimientos"
          color="#10B981"
          onPress={() => navigation.navigate('Instituciones')}
        />
        <QuickAction
          icon="clipboard"
          title="Nueva Visita"
          subtitle="Registrar auditoría"
          color="#3B82F6"
          onPress={() => navigation.navigate('Visitas')}
        />
        <QuickAction
          icon="pie-chart"
          title="Reportes"
          subtitle="Estadísticas generales"
          color="#F59E0B"
          onPress={() => navigation.navigate('Dashboard')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Administración</Text>
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('Alimentos')}
          >
            <Ionicons name="fast-food" size={24} color="#F43F5E" />
            <Text style={styles.gridTitle}>Alimentos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('Categorias')}
          >
            <Ionicons name="pricetags" size={24} color="#8B5CF6" />
            <Text style={styles.gridTitle}>Categorías</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('Ranking')}
          >
            <Ionicons name="trophy" size={24} color="#EAB308" />
            <Text style={styles.gridTitle}>Ranking</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#3B82F6" />
        <Text style={styles.infoText}>
          Los cambios realizados sin internet se sincronizarán pronto automáticamente.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  hero: {
    padding: 24,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  profileButton: {
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    width: '31%',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
    marginTop: 8,
  },
  infoBox: {
    margin: 24,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 13,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 18,
  },
})