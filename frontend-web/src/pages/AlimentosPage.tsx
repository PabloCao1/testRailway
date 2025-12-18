import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import { Card } from '../components/ui/Card'
import axios from 'axios'

interface Alimento {
  id: number
  codigo_argenfood: number
  nombre: string
  categoria: number
  categoria_nombre?: string
  energia_kcal: number | null
  proteinas_g: number | null
  grasas_totales_g?: number | null
  carbohidratos_totales_g?: number | null
}

interface Categoria {
  id: number
  codigo: string
  nombre: string
}

export function AlimentosPage() {
  const [alimentos, setAlimentos] = useState<Alimento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<any>({
    codigo_argenfood: '',
    nombre: '',
    categoria: '',
    energia_kcal: '',
    proteinas_g: '',
    grasas_totales_g: '',
    carbohidratos_totales_g: '',
    agua_g: ''
  })

  const getCamposAdicionales = (categoriaId: string) => {
    const id = parseInt(categoriaId)
    const campos = [
      { key: 'agua_g', label: 'Agua (g)' }
    ]
    
    switch(id) {
      case 1: // Cereales
        return [...campos, 
          { key: 'fibra_g', label: 'Fibra (g)' },
          { key: 'sodio_mg', label: 'Sodio (mg)' },
          { key: 'calcio_mg', label: 'Calcio (mg)' },
          { key: 'hierro_mg', label: 'Hierro (mg)' },
          { key: 'zinc_mg', label: 'Zinc (mg)' }
        ]
      case 2: // Frutas
        return [...campos,
          { key: 'fibra_g', label: 'Fibra (g)' },
          { key: 'vitamina_c_mg', label: 'Vitamina C (mg)' },
          { key: 'potasio_mg', label: 'Potasio (mg)' },
          { key: 'calcio_mg', label: 'Calcio (mg)' }
        ]
      case 3: // Vegetales
        return [...campos,
          { key: 'fibra_g', label: 'Fibra (g)' },
          { key: 'vitamina_c_mg', label: 'Vitamina C (mg)' },
          { key: 'sodio_mg', label: 'Sodio (mg)' },
          { key: 'calcio_mg', label: 'Calcio (mg)' },
          { key: 'hierro_mg', label: 'Hierro (mg)' }
        ]
      case 4: // Grasas y Aceites
        return [...campos,
          { key: 'grasas_saturadas_g', label: 'Grasas saturadas (g)' },
          { key: 'grasas_monoinsat_g', label: 'Grasas monoinsaturadas (g)' },
          { key: 'grasas_poliinsat_g', label: 'Grasas poliinsaturadas (g)' }
        ]
      case 5: // Pescados
        return [...campos,
          { key: 'sodio_mg', label: 'Sodio (mg)' },
          { key: 'calcio_mg', label: 'Calcio (mg)' },
          { key: 'hierro_mg', label: 'Hierro (mg)' },
          { key: 'zinc_mg', label: 'Zinc (mg)' },
          { key: 'grasas_saturadas_g', label: 'Grasas saturadas (g)' }
        ]
      case 6: // Mariscos
        return [...campos,
          { key: 'sodio_mg', label: 'Sodio (mg)' },
          { key: 'calcio_mg', label: 'Calcio (mg)' },
          { key: 'hierro_mg', label: 'Hierro (mg)' },
          { key: 'fosforo_mg', label: 'Fósforo (mg)' }
        ]
      case 7: // Conservas
        return campos
      default:
        return campos
    }
  }

  useEffect(() => {
    fetchAlimentos()
    fetchCategorias()
  }, [])

  const fetchAlimentos = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/nutricion/alimentos/')
      setAlimentos(res.data.results || res.data)
    } catch (error) {
      console.error('Error cargando alimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategorias = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/nutricion/categorias/')
      setCategorias(res.data.results || res.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data: any = {
        codigo_argenfood: parseInt(formData.codigo_argenfood),
        nombre: formData.nombre,
        categoria: parseInt(formData.categoria),
        energia_kcal: formData.energia_kcal ? parseFloat(formData.energia_kcal) : null,
        proteinas_g: formData.proteinas_g ? parseFloat(formData.proteinas_g) : null,
        grasas_totales_g: formData.grasas_totales_g ? parseFloat(formData.grasas_totales_g) : null,
        carbohidratos_totales_g: formData.carbohidratos_totales_g ? parseFloat(formData.carbohidratos_totales_g) : null
      }
      
      // Agregar campos adicionales
      getCamposAdicionales(formData.categoria).forEach(campo => {
        if (formData[campo.key]) {
          data[campo.key] = parseFloat(formData[campo.key])
        }
      })
      if (editingId) {
        await axios.put(`http://localhost:8000/api/nutricion/alimentos/${editingId}/`, data)
      } else {
        await axios.post('http://localhost:8000/api/nutricion/alimentos/', data)
      }
      fetchAlimentos()
      setShowForm(false)
      setEditingId(null)
      setFormData({ codigo_argenfood: '', nombre: '', categoria: '', energia_kcal: '', proteinas_g: '', grasas_totales_g: '', carbohidratos_totales_g: '', agua_g: '' })
    } catch (error) {
      console.error('Error guardando alimento:', error)
      alert('Error al guardar el alimento')
    }
  }

  const handleEdit = async (alimento: Alimento) => {
    try {
      // Obtener el alimento completo con todos sus campos
      const res = await axios.get(`http://localhost:8000/api/nutricion/alimentos/${alimento.id}/`)
      const alimentoCompleto = res.data
      
      const newFormData: any = {
        codigo_argenfood: alimentoCompleto.codigo_argenfood.toString(),
        nombre: alimentoCompleto.nombre,
        categoria: alimentoCompleto.categoria.toString(),
        energia_kcal: alimentoCompleto.energia_kcal?.toString() || '',
        proteinas_g: alimentoCompleto.proteinas_g?.toString() || '',
        grasas_totales_g: alimentoCompleto.grasas_totales_g?.toString() || '',
        carbohidratos_totales_g: alimentoCompleto.carbohidratos_totales_g?.toString() || ''
      }
      
      // Cargar campos adicionales
      getCamposAdicionales(alimentoCompleto.categoria.toString()).forEach(campo => {
        if (alimentoCompleto[campo.key]) {
          newFormData[campo.key] = alimentoCompleto[campo.key].toString()
        }
      })
      
      setFormData(newFormData)
      setEditingId(alimento.id)
      setShowForm(true)
    } catch (error) {
      console.error('Error cargando alimento:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este alimento?')) {
      try {
        await axios.delete(`http://localhost:8000/api/nutricion/alimentos/${id}/`)
        fetchAlimentos()
      } catch (error) {
        console.error('Error eliminando alimento:', error)
        alert('Error al eliminar el alimento')
      }
    }
  }

  const filtered = alimentos.filter(a => 
    a.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    a.codigo_argenfood.toString().includes(debouncedSearch)
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🍎 Alimentos Nutricionales</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ codigo_argenfood: '', nombre: '', categoria: '', energia_kcal: '', proteinas_g: '', grasas_totales_g: '', carbohidratos_totales_g: '', agua_g: '' }); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? '✕ Cancelar' : '+ Nuevo Alimento'}
        </button>
      </div>

      {showForm && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Editar Alimento' : 'Nuevo Alimento'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código Argenfood *</label>
                <input
                  type="number"
                  value={formData.codigo_argenfood}
                  onChange={(e) => setFormData({ ...formData, codigo_argenfood: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Ej: 484"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ej: Arroz, grano, blanco, pulido, crudo"
                required
              />
            </div>
            <h4 className="font-semibold text-gray-700 mt-4 mb-2">Energia Y Macro nutriente</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Energía (kcal)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.energia_kcal}
                  onChange={(e) => setFormData({ ...formData, energia_kcal: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="339.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proteínas (g)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.proteinas_g}
                  onChange={(e) => setFormData({ ...formData, proteinas_g: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="6.9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grasas totales (g)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.grasas_totales_g}
                  onChange={(e) => setFormData({ ...formData, grasas_totales_g: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0.2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Carbohidratos (g)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.carbohidratos_totales_g}
                  onChange={(e) => setFormData({ ...formData, carbohidratos_totales_g: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="79.2"
                />
              </div>
            </div>
            
            {formData.categoria && (
              <>
                <h4 className="font-semibold text-gray-700 mt-4 mb-2">
                  Campos Adicionales - {categorias.find(c => c.id === parseInt(formData.categoria))?.nombre}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getCamposAdicionales(formData.categoria).map(campo => (
                    <div key={campo.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{campo.label}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData[campo.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [campo.key]: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                {editingId ? '✓ Actualizar' : '✓ Guardar'}
              </button>
              <button 
                type="button" 
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
              >
                ✕ Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Código</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Categoría</th>
                <th className="text-right p-3">Energía (kcal)</th>
                <th className="text-right p-3">Proteínas (g)</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No hay alimentos</td></tr>
              ) : filtered.slice(0, 50).map((alimento) => (
                <tr key={alimento.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{alimento.codigo_argenfood}</td>
                  <td className="p-3">{alimento.nombre}</td>
                  <td className="p-3 text-sm text-gray-600">
                    {categorias.find(c => c.id === alimento.categoria)?.nombre || '-'}
                  </td>
                  <td className="p-3 text-right">{alimento.energia_kcal || '-'}</td>
                  <td className="p-3 text-right">{alimento.proteinas_g || '-'}</td>
                  <td className="p-3 text-right space-x-2">
                    <button onClick={() => handleEdit(alimento)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => handleDelete(alimento.id)} className="text-red-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Mostrando 50 de {filtered.length} resultados
          </div>
        )}
      </Card>
    </div>
  )
}
