import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { auditoriaService, Institucion } from '../services/auditoriaService'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'

export const InstitucionesPage: React.FC = () => {
  const navigate = useNavigate()
  const [instituciones, setInstituciones] = useState<Institucion[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch] = useDebounce(searchTerm, 500)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const ITEMS_PER_PAGE = 12
  const [formData, setFormData] = useState<Partial<Institucion>>({
    codigo: '',
    nombre: '',
    tipo: 'escuela',
    direccion: '',
    barrio: '',
    comuna: '',
    activo: true,
  })

  useEffect(() => {
    setPage(1)
    setInstituciones([])
    loadInstituciones(true)
  }, [debouncedSearch])

  const loadInstituciones = async (reset = false) => {
    try {
      setLoading(true)
      const currentPage = reset ? 1 : page
      const data = await auditoriaService.getInstituciones({ 
        search: debouncedSearch,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      })
      
      if (reset) {
        setInstituciones(data.results)
        setPage(2)
      } else {
        setInstituciones(prev => [...prev, ...data.results])
        setPage(prev => prev + 1)
      }
      
      setHasMore(data.next !== null)
      setTotalCount(data.count || data.results.length)
    } catch (error) {
      console.error('Error loading instituciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadInstituciones()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await auditoriaService.updateInstitucion(editingId, formData)
      } else {
        await auditoriaService.createInstitucion(formData)
      }
      setIsModalOpen(false)
      resetForm()
      setPage(1)
      setInstituciones([])
      loadInstituciones(true)
    } catch (error) {
      console.error('Error saving institucion:', error)
    }
  }

  const handleEdit = (institucion: Institucion) => {
    setEditingId(institucion.id)
    setFormData(institucion)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta institución?')) {
      try {
        await auditoriaService.deleteInstitucion(id)
        setPage(1)
        setInstituciones([])
        loadInstituciones(true)
      } catch (error) {
        console.error('Error deleting institucion:', error)
      }
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      codigo: '',
      nombre: '',
      tipo: 'escuela',
      direccion: '',
      barrio: '',
      comuna: '',
      activo: true,
    })
  }

  const tipoOptions = [
    { value: 'escuela', label: 'Escuela' },
    { value: 'cdi', label: 'CDI' },
    { value: 'hogar', label: 'Hogar' },
    { value: 'geriatrico', label: 'Geriátrico' },
    { value: 'otro', label: 'Otro' },
  ]

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      escuela: '🏫',
      cdi: '🏬',
      hogar: '🏠',
      geriatrico: '🏛️',
      otro: '🏭'
    }
    return icons[tipo] || '🏭'
  }

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      escuela: 'from-blue-500 to-cyan-500',
      cdi: 'from-purple-500 to-pink-500',
      hogar: 'from-green-500 to-emerald-500',
      geriatrico: 'from-orange-500 to-amber-500',
      otro: 'from-gray-500 to-slate-500'
    }
    return colors[tipo] || 'from-gray-500 to-slate-500'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">🏫 Instituciones</h1>
            <p className="text-indigo-100 text-sm sm:text-base md:text-lg">
              {totalCount > 0 ? `${totalCount} instituciones registradas` : 'Instituciones registradas'}
              {debouncedSearch && ` (filtradas por "${debouncedSearch}")`}
            </p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setIsModalOpen(true)
            }}
            className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            Nueva Institución
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, código, barrio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:outline-none shadow-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Cargando instituciones...</p>
        </div>
      ) : instituciones.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-gray-500 text-lg">No se encontraron instituciones</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {instituciones.map((inst) => (
            <div
              key={inst.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105"
            >
              {/* Header con gradiente */}
              <div className={`bg-gradient-to-r ${getTipoColor(inst.tipo)} p-4 sm:p-6 text-white`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <span className="text-3xl sm:text-4xl flex-shrink-0">{getTipoIcon(inst.tipo)}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-90">{inst.tipo}</span>
                      <h3 className="text-base sm:text-xl font-bold mt-1 truncate">{inst.nombre}</h3>
                    </div>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                    inst.activo ? 'bg-green-400 text-green-900' : 'bg-gray-400 text-gray-900'
                  }`}>
                    {inst.activo ? '✓ Activa' : '✕ Inactiva'}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  <span className="font-mono text-sm font-semibold">{inst.codigo}</span>
                </div>

                {inst.direccion && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-indigo-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{inst.direccion}</span>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {inst.barrio && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      🏘️ {inst.barrio}
                    </span>
                  )}
                  {inst.comuna && (
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                      🗺️ Comuna {inst.comuna}
                    </span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => navigate(`/instituciones/${inst.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  <EyeIcon className="w-4 h-4" />
                  Ver Detalle
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(inst)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                  >
                    <PencilIcon className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleDelete(inst.id)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    <TrashIcon className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón Cargar Más */}
      {!loading && hasMore && instituciones.length > 0 && (
        <div className="text-center py-6">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg"
          >
            Cargar más instituciones
          </button>
        </div>
      )}

      {/* Indicador de carga */}
      {loading && instituciones.length > 0 && (
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Cargando más...</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingId ? 'Editar Institución' : 'Nueva Institución'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Código"
            required
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
          />
          <Input
            label="Nombre"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
          <Select
            label="Tipo"
            required
            options={tipoOptions}
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          />
          <Input
            label="Dirección"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
          />
          <Input
            label="Barrio"
            value={formData.barrio}
            onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
          />
          <Input
            label="Comuna"
            value={formData.comuna}
            onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="activo">Activa</label>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                resetForm()
              }}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
