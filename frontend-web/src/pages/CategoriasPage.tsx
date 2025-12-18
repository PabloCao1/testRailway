import { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import axios from 'axios'

interface Categoria {
  id: number
  codigo: string
  nombre: string
}

export function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ codigo: '', nombre: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/nutricion/categorias/')
      setCategorias(res.data.results || res.data)
    } catch (error) {
      console.error('Error cargando categorías:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axios.put(`http://localhost:8000/api/nutricion/categorias/${editingId}/`, formData)
      } else {
        await axios.post('http://localhost:8000/api/nutricion/categorias/', formData)
      }
      fetchCategorias()
      setShowForm(false)
      setFormData({ codigo: '', nombre: '' })
      setEditingId(null)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEdit = (cat: Categoria) => {
    setFormData({ codigo: cat.codigo, nombre: cat.nombre })
    setEditingId(cat.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar categoría?')) {
      try {
        await axios.delete(`http://localhost:8000/api/nutricion/categorias/${id}/`)
        fetchCategorias()
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🏷️ Categorías de Alimentos</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ codigo: '', nombre: '' }) }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : '+ Nueva Categoría'}
        </button>
      </div>

      {showForm && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ej: CER, FRT, HOR"
                maxLength={10}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ej: Cereales y derivados"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                {editingId ? '✓ Actualizar' : '✓ Guardar'}
              </button>
              <button 
                type="button" 
                onClick={() => { setShowForm(false); setEditingId(null); setFormData({ codigo: '', nombre: '' }); }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
              >
                ✕ Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">Cargando...</td></tr>
            ) : categorias.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">No hay categorías</td></tr>
            ) : categorias.map((cat) => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono">{cat.codigo}</td>
                <td className="p-3">{cat.nombre}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
