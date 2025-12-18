import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline'
import { auditoriaService, VisitaAuditoria, Institucion } from '../services/auditoriaService'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'

export const VisitasPage: React.FC = () => {
  const navigate = useNavigate()
  const [visitas, setVisitas] = useState<VisitaAuditoria[]>([])
  const [instituciones, setInstituciones] = useState<Institucion[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<VisitaAuditoria>>({
    institucion: 0,
    fecha: new Date().toISOString().split('T')[0],
    tipo_comida: 'almuerzo',
    observaciones: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [visitasData, instData] = await Promise.all([
        auditoriaService.getVisitas(),
        auditoriaService.getInstituciones(),
      ])
      setVisitas(visitasData.results)
      setInstituciones(instData.results)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newVisita = await auditoriaService.createVisita(formData)
      setIsModalOpen(false)
      navigate(`/visitas/${newVisita.id}`)
    } catch (error) {
      console.error('Error creating visita:', error)
    }
  }

  const tipoComidaOptions = [
    { value: 'desayuno', label: 'Desayuno' },
    { value: 'almuerzo', label: 'Almuerzo' },
    { value: 'merienda', label: 'Merienda' },
    { value: 'cena', label: 'Cena' },
    { value: 'vianda', label: 'Vianda' },
  ]

  const getTipoComidaIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      desayuno: '☕',
      almuerzo: '🍽️',
      merienda: '🧁',
      cena: '🌙',
      vianda: '🥡'
    }
    return icons[tipo] || '🍴'
  }

  const getTipoComidaColor = (tipo: string) => {
    const colors: Record<string, string> = {
      desayuno: 'from-yellow-500 to-orange-500',
      almuerzo: 'from-red-500 to-pink-500',
      merienda: 'from-purple-500 to-pink-500',
      cena: 'from-indigo-500 to-blue-500',
      vianda: 'from-green-500 to-teal-500'
    }
    return colors[tipo] || 'from-gray-500 to-slate-500'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">📋 Visitas de Auditoría</h1>
            <p className="text-emerald-100 text-sm sm:text-base md:text-lg">{visitas.length} visitas registradas</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            Nueva Visita
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Cargando visitas...</p>
        </div>
      ) : visitas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-gray-500 text-lg">No se encontraron visitas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {visitas.map((visita) => (
            <div
              key={visita.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105"
            >
              {/* Header con gradiente */}
              <div className={`bg-gradient-to-r ${getTipoComidaColor(visita.tipo_comida)} p-4 sm:p-6 text-white`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <span className="text-3xl sm:text-4xl flex-shrink-0">{getTipoComidaIcon(visita.tipo_comida)}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-90">{visita.tipo_comida}</span>
                      <h3 className="text-base sm:text-xl font-bold mt-1 truncate">{visita.institucion_nombre}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-sm">{new Date(visita.fecha).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                {visita.observaciones && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-emerald-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span className="text-sm italic">{visita.observaciones}</span>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <button
                  onClick={() => navigate(`/visitas/${visita.id}`)}
                  className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Ver Detalle y Platos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Visita"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Institución"
            required
            options={[
              { value: 0, label: 'Seleccione...' },
              ...instituciones.map((i) => ({ value: i.id, label: i.nombre })),
            ]}
            value={formData.institucion}
            onChange={(e) => setFormData({ ...formData, institucion: Number(e.target.value) })}
          />
          <Input
            label="Fecha"
            type="date"
            required
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
          />
          <Select
            label="Tipo de Comida"
            required
            options={tipoComidaOptions}
            value={formData.tipo_comida}
            onChange={(e) => setFormData({ ...formData, tipo_comida: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button type="submit">Crear y Agregar Platos</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
