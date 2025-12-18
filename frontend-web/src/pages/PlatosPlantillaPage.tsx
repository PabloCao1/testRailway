import { useState, useEffect } from 'react'
import { auditoriaService, PlatoPlantilla } from '../services/auditoriaService'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { useNavigate } from 'react-router-dom'

const TIPOS_PLATO = [
  { value: 'principal', label: 'Plato principal' },
  { value: 'guarnicion', label: 'Guarnición' },
  { value: 'postre', label: 'Postre' },
  { value: 'bebida', label: 'Bebida' },
  { value: 'otro', label: 'Otro' },
]

export default function PlatosPlantillaPage() {
  const navigate = useNavigate()
  const [platos, setPlatos] = useState<PlatoPlantilla[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlato, setEditingPlato] = useState<PlatoPlantilla | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')

  const [formData, setFormData] = useState({
    nombre: '',
    tipo_plato: 'principal',
    descripcion: '',
    activo: true,
  })

  useEffect(() => {
    loadPlatos()
  }, [searchTerm, tipoFilter])

  const loadPlatos = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      if (tipoFilter) params.tipo_plato = tipoFilter
      const data = await auditoriaService.getPlatosPlantilla(params)
      setPlatos(data.results || [])
    } catch (error) {
      console.error('Error al cargar platos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (plato?: PlatoPlantilla) => {
    if (plato) {
      setEditingPlato(plato)
      setFormData({
        nombre: plato.nombre,
        tipo_plato: plato.tipo_plato,
        descripcion: plato.descripcion || '',
        activo: plato.activo,
      })
    } else {
      setEditingPlato(null)
      setFormData({
        nombre: '',
        tipo_plato: 'principal',
        descripcion: '',
        activo: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPlato(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPlato) {
        await auditoriaService.updatePlatoPlantilla(editingPlato.id, formData)
      } else {
        await auditoriaService.createPlatoPlantilla(formData)
      }
      handleCloseModal()
      loadPlatos()
    } catch (error) {
      console.error('Error al guardar plato:', error)
      alert('Error al guardar el plato')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este plato?')) return
    try {
      await auditoriaService.deletePlatoPlantilla(id)
      loadPlatos()
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('Error al eliminar el plato')
    }
  }

  const handleVerDetalle = (id: number) => {
    navigate(`/platos-plantilla/${id}`)
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Platos Precargados</h1>
        <p className="text-gray-600">Administre platos que puede reutilizar en las visitas</p>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Buscar plato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {TIPOS_PLATO.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
          <Button onClick={() => handleOpenModal()}>+ Nuevo Plato</Button>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : platos.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            No hay platos precargados. Cree uno nuevo para comenzar.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platos.map((plato) => (
            <Card key={plato.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{plato.nombre}</h3>
                  <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 mt-1">
                    {TIPOS_PLATO.find((t) => t.value === plato.tipo_plato)?.label}
                  </span>
                </div>
                {!plato.activo && (
                  <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-600">
                    Inactivo
                  </span>
                )}
              </div>

              {plato.descripcion && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{plato.descripcion}</p>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs mb-4 bg-gray-50 p-2 rounded">
                <div>
                  <span className="text-gray-500">Energía:</span>
                  <span className="ml-1 font-medium">{Number(plato.energia_kcal_total || 0).toFixed(0)} kcal</span>
                </div>
                <div>
                  <span className="text-gray-500">Proteínas:</span>
                  <span className="ml-1 font-medium">{Number(plato.proteinas_g_total || 0).toFixed(1)} g</span>
                </div>
                <div>
                  <span className="text-gray-500">Ingredientes:</span>
                  <span className="ml-1 font-medium">{plato.cantidad_ingredientes || 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleVerDetalle(plato.id)}
                  className="flex-1"
                >
                  Ver Detalle
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenModal(plato)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(plato.id)}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingPlato ? 'Editar Plato' : 'Nuevo Plato'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Plato *</label>
            <select
              value={formData.tipo_plato}
              onChange={(e) => setFormData({ ...formData, tipo_plato: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIPOS_PLATO.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="activo" className="text-sm text-gray-700">
              Activo
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingPlato ? 'Actualizar' : 'Crear'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
