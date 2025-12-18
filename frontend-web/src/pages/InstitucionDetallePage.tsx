import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, CalendarIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { auditoriaService, Institucion, VisitaAuditoria } from '../services/auditoriaService'

export const InstitucionDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [institucion, setInstitucion] = useState<Institucion | null>(null)
  const [visitas, setVisitas] = useState<VisitaAuditoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [instData, visitasData] = await Promise.all([
        auditoriaService.getInstitucion(Number(id)),
        auditoriaService.getVisitas({ institucion: Number(id) })
      ])
      setInstitucion(instData)
      setVisitas(visitasData.results)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const getTipoComidaIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      desayuno: '☕',
      almuerzo: '🍽️',
      merienda: '🧁',
      cena: '🌙',
      vianda: '📦'
    }
    return icons[tipo] || '🍴'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando información...</p>
        </div>
      </div>
    )
  }

  if (!institucion) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">Institución no encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header Hero */}
      <div className={`bg-gradient-to-r ${getTipoColor(institucion.tipo)} text-white shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <button
            onClick={() => navigate('/instituciones')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Volver a Instituciones</span>
          </button>

          <div className="flex items-start gap-6">
            <div className="text-7xl">{getTipoIcon(institucion.tipo)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold uppercase tracking-wider">
                  {institucion.tipo}
                </span>
                <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                  institucion.activo ? 'bg-green-400 text-green-900' : 'bg-gray-400 text-gray-900'
                }`}>
                  {institucion.activo ? '✓ Activa' : '✕ Inactiva'}
                </span>
              </div>
              <h1 className="text-5xl font-bold mb-3">{institucion.nombre}</h1>
              <div className="flex items-center gap-2 text-white/90 text-lg">
                <span className="font-mono font-semibold">#{institucion.codigo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-700">Ubicación</h3>
            </div>
            <p className="text-gray-600">{institucion.direccion || 'No especificada'}</p>
            <div className="flex gap-2 mt-3">
              {institucion.barrio && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  🏘️ {institucion.barrio}
                </span>
              )}
              {institucion.comuna && (
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                  🗺️ Comuna {institucion.comuna}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-700">Visitas Registradas</h3>
            </div>
            <p className="text-4xl font-bold text-green-600">{visitas.length}</p>
            <p className="text-sm text-gray-500 mt-1">auditorías realizadas</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-700">Formularios</h3>
            </div>
            <p className="text-4xl font-bold text-purple-600">
              {visitas.filter(v => localStorage.getItem(`formulario_visita_${v.id}`)).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">completados</p>
          </div>
        </div>

        {/* Historial de Visitas */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8 text-white" />
              <h2 className="text-3xl font-bold text-white">Historial de Auditorías</h2>
            </div>
          </div>

          <div className="p-8">
            {visitas.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 text-lg">No hay visitas registradas</p>
                <button
                  onClick={() => navigate('/visitas')}
                  className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Registrar Primera Visita
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {visitas.map((visita) => {
                  const tieneFormulario = !!localStorage.getItem(`formulario_visita_${visita.id}`)
                  return (
                    <div
                      key={visita.id}
                      className="group relative bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
                      
                      <div className="relative p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-3xl">{getTipoComidaIcon(visita.tipo_comida)}</span>
                              <div>
                                <h3 className="text-xl font-bold text-gray-800 capitalize">{visita.tipo_comida}</h3>
                                <p className="text-sm text-gray-500">
                                  {new Date(visita.fecha).toLocaleDateString('es-AR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>

                            {visita.observaciones && (
                              <div className="mt-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                <p className="text-sm text-gray-700">{visita.observaciones}</p>
                              </div>
                            )}

                            <div className="flex gap-3 mt-4">
                              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                                {visita.platos?.length || 0} platos
                              </span>
                              {tieneFormulario && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                  <DocumentTextIcon className="w-4 h-4" />
                                  Formulario completado
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/visitas/${visita.id}`)}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            Ver Detalle →
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
