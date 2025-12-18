import React, { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import apiClient from '../services/apiClient'

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  date_joined: string
}

interface UserForm {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
}

const userService = {
  getUsers: () => apiClient.get('/users/').then(res => res.data),
  createUser: (data: UserForm) => apiClient.post('/users/', data).then(res => res.data),
  updateUser: (id: number, data: Partial<UserForm>) => apiClient.put(`/users/${id}/`, data).then(res => res.data),
  deleteUser: (id: number) => apiClient.delete(`/users/${id}/`),
}

export function UsersScreen() {
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserForm>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: ''
  })

  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  })

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserForm> }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: ''
    })
    setShowForm(false)
    setEditingUser(null)
  }

  const handleSubmit = () => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: ''
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
      ]
    )
  }

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.first_name?.[0] || item.username?.[0] || 'U'}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={styles.fullName}>{item.first_name} {item.last_name}</Text>
          <View style={[styles.status, item.is_active ? styles.active : styles.inactive]}>
            <Text style={[styles.statusText, item.is_active ? styles.activeText : styles.inactiveText]}>
              {item.is_active ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.editButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text>Cargando usuarios...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👥 Gestión de Usuarios</Text>
        <Button title="➕ Nuevo" onPress={() => setShowForm(true)} />
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
            </Text>
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Usuario</Text>
              <Input
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <Input
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <Input
                value={formData.first_name}
                onChangeText={(text) => setFormData({ ...formData, first_name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellido</Text>
              <Input
                value={formData.last_name}
                onChangeText={(text) => setFormData({ ...formData, last_name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Contraseña {editingUser && '(dejar vacío para no cambiar)'}
              </Text>
              <Input
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
              />
            </View>

            <View style={styles.formActions}>
              <Button
                title={editingUser ? 'Actualizar' : 'Crear'}
                onPress={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              />
              <Button
                title="Cancelar"
                onPress={resetForm}
                variant="secondary"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  fullName: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  active: {
    backgroundColor: '#dcfce7',
  },
  inactive: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#166534',
  },
  inactiveText: {
    color: '#dc2626',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#374151',
    fontSize: 14,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 14,
  },
  modal: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    gap: 12,
  },
})