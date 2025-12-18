import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
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

export function UsersPage() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <div>Cargando usuarios...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">👥 Gestión de Usuarios</h1>
        <Button onClick={() => setShowForm(true)}>
          ➕ Nuevo Usuario
        </Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">
            {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {editingUser && '(dejar vacío para no cambiar)'}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingUser ? 'Actualizar' : 'Crear'}
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold mb-4">Lista de Usuarios</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre Completo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(users) ? users.map((user: User) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">
                          {user.first_name?.[0] || user.username?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="ghost" onClick={() => handleEdit(user)}>
                      ✏️ Editar
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ Eliminar
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No hay usuarios disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}