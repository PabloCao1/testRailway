import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { DrawerContentScrollView } from '@react-navigation/drawer'
import { useAuthStore } from '../../store/authStore'

export function DrawerContent(props: any) {
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>
          {user?.first_name || user?.username || 'Usuario'}
        </Text>
      </View>

      <View style={styles.menu}>
        <Text style={styles.sectionTitle}>GENERAL</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => props.navigation.navigate('Home')}
        >
          <Text style={styles.menuItemText}>Inicio</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>ADMINISTRACIÓN</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => props.navigation.navigate('Users')}
        >
          <Text style={styles.menuItemText}>Usuarios</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
  },
  menu: {
    flex: 1,
    paddingTop: 24,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 24,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  menuItemText: {
    color: '#f1f5f9',
    fontSize: 16,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  logoutButton: {
    paddingVertical: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
})