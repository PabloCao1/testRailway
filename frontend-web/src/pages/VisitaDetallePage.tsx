import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useDebounce } from 'use-debounce'
import { auditoriaService, PlatoObservado, IngredientePlato } from '../services/auditoriaService'
import { nutricionService, AlimentoNutricional } from '../services/nutricionService'
import { useInstitucionesStore } from '../store/institucionesStore'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'

export const VisitaDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [visita, setVisita] = useState<any>(null)
  const [platos, setPlatos] = useState<PlatoObservado[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlatoModalOpen, setIsPlatoModalOpen] = useState(false)
  const [isIngredienteModalOpen, setIsIngredienteModalOpen] = useState(false)
  const [selectedPlato, setSelectedPlato] = useState<number | null>(null)
  const [alimentos, setAlimentos] = useState<AlimentoNutricional[]>([])
  const [searchAlimento, setSearchAlimento] = useState('')
  const [debouncedSearch] = useDebounce(searchAlimento, 300)
  const [expandedPlatos, setExpandedPlatos] = useState<Set<number>>(new Set())
  const { load: loadInstituciones } = useInstitucionesStore()

  const [platoForm, setPlatoForm] = useState({
    nombre: '',
    tipo_plato: 'principal',
    porciones_servidas: '',
    notas: '',
  })

  const [ingredienteForm, setIngredienteForm] = useState({
    alimento: 0,
    cantidad: '',
    unidad: 'g',
  })

  useEffect(() => {
    loadVisita()
    loadInstituciones() // Pre-cargar instituciones para modales
  }, [id, loadInstituciones])

  useEffect(() => {
    if (debouncedSearch.length > 2) {
      searchAlimentos()
    } else {
      setAlimentos([])
    }
  }, [debouncedSearch])

  const loadVisita = async () => {
    try {
      setLoading(true)
      const visitaData = await auditoriaService.getVisita(Number(id))
      
      // Cargar formulario desde localStorage
      const formularioGuardado = localStorage.getItem(`formulario_visita_${id}`)
      if (formularioGuardado) {
        visitaData.formulario_completado = true
        visitaData.formulario_respuestas = JSON.parse(formularioGuardado)
      }
      
      setVisita(visitaData)
      if (visitaData.platos) {
        setPlatos(visitaData.platos)
      }
    } catch (error) {
      console.error('Error loading visita:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchAlimentos = async () => {
    try {
      const data = await nutricionService.getAlimentos({ search: searchAlimento })
      setAlimentos(data.results)
    } catch (error) {
      console.error('Error searching alimentos:', error)
    }
  }

  const handleCreatePlato = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await auditoriaService.createPlato({
        visita: Number(id),
        ...platoForm,
        porciones_servidas: platoForm.porciones_servidas ? Number(platoForm.porciones_servidas) : undefined,
      })
      setIsPlatoModalOpen(false)
      setPlatoForm({ nombre: '', tipo_plato: 'principal', porciones_servidas: '', notas: '' })
      loadVisita()
    } catch (error) {
      console.error('Error creating plato:', error)
    }
  }

  const handleAddIngrediente = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await auditoriaService.createIngrediente({
        plato: selectedPlato!,
        alimento: ingredienteForm.alimento,
        cantidad: Number(ingredienteForm.cantidad),
        unidad: ingredienteForm.unidad,
      })
      setIsIngredienteModalOpen(false)
      setIngredienteForm({ alimento: 0, cantidad: '', unidad: 'g' })
      setSearchAlimento('')
      loadVisita()
    } catch (error) {
      console.error('Error adding ingrediente:', error)
    }
  }

  const handleDeleteIngrediente = async (ingredienteId: number) => {
    if (confirm('¿Eliminar este ingrediente?')) {
      try {
        await auditoriaService.deleteIngrediente(ingredienteId)
        loadVisita()
      } catch (error) {
        console.error('Error deleting ingrediente:', error)
      }
    }
  }

  const handleDeletePlato = async (platoId: number) => {
    if (confirm('¿Eliminar este plato?')) {
      try {
        await auditoriaService.deletePlato(platoId)
        loadVisita()
      } catch (error) {
        console.error('Error deleting plato:', error)
      }
    }
  }

  const tipoPlatoOptions = [
    { value: 'principal', label: 'Plato principal' },
    { value: 'guarnicion', label: 'Guarnición' },
    { value: 'postre', label: 'Postre' },
    { value: 'bebida', label: 'Bebida' },
    { value: 'otro', label: 'Otro' },
  ]

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <span className="text-4xl">🍽️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">{visita?.institucion_nombre}</h1>
              <div className="flex gap-3 text-sm">
                <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">📅 {visita?.fecha}</span>
                <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm capitalize">🕐 {visita?.tipo_comida}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/visitas/${id}/formulario`)} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold">
              📋 Formulario
            </Button>
            <Button onClick={() => navigate('/visitas')} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
              ← Volver
            </Button>
          </div>
        </div>
        {visita?.observaciones && (
          <p className="mt-4 text-blue-50 bg-white/10 rounded-lg p-3 backdrop-blur-sm text-sm">{visita.observaciones}</p>
        )}
      </div>

      {/* Tabla de Platos */}
      <Card className="overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-b-2 border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              <span className="text-3xl sm:text-4xl">🍲</span> Platos Observados
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 ml-0 sm:ml-1">{platos.length} plato{platos.length !== 1 ? 's' : ''} registrado{platos.length !== 1 ? 's' : ''}</p>
          </div>
          <Button onClick={() => setIsPlatoModalOpen(true)} className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base md:text-lg">
            <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Agregar Plato
          </Button>
        </div>

        {platos.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🍽️</div>
            <p className="text-gray-500 text-base sm:text-lg">No hay platos registrados</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Comienza agregando un plato a esta visita</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plato</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Porciones</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Ingredientes</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Energía</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {platos.map((plato) => (
                  <React.Fragment key={plato.id}>
                  <tr className="hover:bg-gray-50 transition-colors bg-white">
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">{plato.nombre}</div>
                      {plato.notas && <div className="text-xs text-gray-500 mt-1">{plato.notas}</div>}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <span className="px-2 sm:px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                        {plato.tipo_plato}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center">
                      <span className="font-semibold text-gray-700 text-sm sm:text-base">{plato.porciones_servidas || '-'}</span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm font-medium">
                        {plato.ingredientes?.length || 0}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center">
                      <span className="font-bold text-orange-600 text-sm sm:text-base">{plato.energia_kcal_total ? Number(plato.energia_kcal_total).toFixed(0) : 0}</span>
                      <span className="text-xs text-gray-500 ml-1">kcal</span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPlato(plato.id)
                            setIsIngredienteModalOpen(true)
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Agregar ingrediente"
                        >
                          <PlusIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeletePlato(plato.id)} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar plato"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {plato.ingredientes && plato.ingredientes.length > 0 && (
                    <tr className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-4 sm:border-b-8 border-indigo-300">
                      <td colSpan={6} className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                              <span>🧂</span> Ingredientes:
                            </h4>
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedPlatos)
                                if (expandedPlatos.has(plato.id)) {
                                  newExpanded.delete(plato.id)
                                } else {
                                  newExpanded.add(plato.id)
                                }
                                setExpandedPlatos(newExpanded)
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              {expandedPlatos.has(plato.id) ? '▼ Ocultar' : '▶ Mostrar'}
                            </button>
                          </div>
                          {expandedPlatos.has(plato.id) && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                              {plato.ingredientes.map((ing) => (
                                <div key={ing.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                                  <span className="text-sm font-medium text-gray-700">
                                    {ing.alimento_nombre}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                      {ing.cantidad}{ing.unidad}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteIngrediente(ing.id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {expandedPlatos.has(plato.id) && (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                              <h5 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                                <span>📊</span> Totales Nutricionales
                              </h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                              {/* Campos comunes */}
                              <div className="bg-white p-2 rounded text-center">
                                <div className="text-xs text-gray-600">Energía</div>
                                <div className="font-bold text-orange-600">{plato.energia_kcal_total ? Number(plato.energia_kcal_total).toFixed(1) : 0}</div>
                                <div className="text-xs text-gray-500">kcal</div>
                              </div>
                              <div className="bg-white p-2 rounded text-center">
                                <div className="text-xs text-gray-600">Proteínas</div>
                                <div className="font-bold text-red-600">{plato.proteinas_g_total ? Number(plato.proteinas_g_total).toFixed(1) : 0}</div>
                                <div className="text-xs text-gray-500">g</div>
                              </div>
                              <div className="bg-white p-2 rounded text-center">
                                <div className="text-xs text-gray-600">Grasas</div>
                                <div className="font-bold text-yellow-600">{plato.grasas_totales_g_total ? Number(plato.grasas_totales_g_total).toFixed(1) : 0}</div>
                                <div className="text-xs text-gray-500">g</div>
                              </div>
                              <div className="bg-white p-2 rounded text-center">
                                <div className="text-xs text-gray-600">Carbohidratos</div>
                                <div className="font-bold text-blue-600">{plato.carbohidratos_g_total ? Number(plato.carbohidratos_g_total).toFixed(1) : 0}</div>
                                <div className="text-xs text-gray-500">g</div>
                              </div>
                              
                              {/* Campos adicionales - solo mostrar si tienen valor > 0 */}
                              {plato.agua_g_total && Number(plato.agua_g_total) > 0 && (
                                <div className="bg-white p-2 rounded text-center">
                                  <div className="text-xs text-gray-600">Agua</div>
                                  <div className="font-bold text-cyan-600">{Number(plato.agua_g_total).toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">g</div>
                                </div>
                              )}
                              {plato.fibra_g_total && Number(plato.fibra_g_total) > 0 && (
                                <div className="bg-white p-2 rounded text-center">
                                  <div className="text-xs text-gray-600">Fibra</div>
                                  <div className="font-bold text-green-600">{Number(plato.fibra_g_total).toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">g</div>
                                </div>
                              )}
                              {plato.sodio_mg_total && Number(plato.sodio_mg_total) > 0 && (
                                <div className="bg-white p-2 rounded text-center">
                                  <div className="text-xs text-gray-600">Sodio</div>
                                  <div className="font-bold text-purple-600">{Number(plato.sodio_mg_total).toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">mg</div>
                                </div>
                              )}
                              {plato.calcio_mg_total && Number(plato.calcio_mg_total) > 0 && (
                                <div className="bg-white p-2 rounded text-center">
                                  <div className="text-xs text-gray-600">Calcio</div>
                                  <div className="font-bold text-indigo-600">{Number(plato.calcio_mg_total).toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">mg</div>
                                </div>
                              )}
                              {plato.hierro_mg_total && Number(plato.hierro_mg_total) > 0 && (
                                <div className="bg-white p-2 rounded text-center">
                                  <div className="text-xs text-gray-600">Hierro</div>
                                  <div className="font-bold text-red-700">{Number(plato.hierro_mg_total).toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">mg</div>
                                </div>
                              )}
                              {plato.zinc_mg_total && Number(plato.zinc_mg_total) > 0 && (
                                <div className="bg-white p-2 rounded text-center">
                                  <div className="text-xs text-gray-600">Zinc</div>
                                  <div className="font-bold text-gray-600">{Number(plato.zinc_mg_total).toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">mg</div>
                                </div>
                              )}
                              {plato.vitamina_c_mg_total && Number(plato.vitamina_c_mg_total) > 0 && (
                                <div className="bg-white p-2 rounded text-center">
                                  <div className="text-xs text-gray-600">Vitamina C</div>
                                  <div className="font-bold text-yellow-500">{Number(plato.vitamina_c_mg_total).toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">mg</div>
                                </div>
                              )}
                              {plato.potasio_mg_total && Number(plato.potasio_mg_total) > 0 && (
                                <div className="bg-white p-2 rounded text-center">
                                  <div className="text-xs text-gray-600">Potasio</div>
                                  <div className="font-bold text-pink-600">{Number(plato.potasio_mg_total).toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">mg</div>
                                </div>
                              )}
                              {plato.fosforo_mg_total && Number(plato.fosforo_mg_total) > 0 && (
                                <div className="bg-white p-2 rounded text-center">
                                  <div className="text-xs text-gray-600">Fósforo</div>
                                  <div className="font-bold text-teal-600">{Number(plato.fosforo_mg_total).toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">mg</div>
                                </div>
                              )}
                              {plato.grasas_saturadas_g_total && Number(plato.grasas_saturadas_g_total) > 0 && (
                                <div className="bg-white p-2 rounded text-center">
                                  <div className="text-xs text-gray-600">Grasas sat.</div>
                                  <div className="font-bold text-red-500">{Number(plato.grasas_saturadas_g_total).toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">g</div>
                                </div>
                              )}
                              {plato.grasas_monoinsat_g_total && Number(plato.grasas_monoinsat_g_total) > 0 && (
                                <div className="bg-white p-2 rounded text-center">
                                  <div className="text-xs text-gray-600">Grasas mono.</div>
                                  <div className="font-bold text-amber-600">{Number(plato.grasas_monoinsat_g_total).toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">g</div>
                                </div>
                              )}
                              {plato.grasas_poliinsat_g_total && Number(plato.grasas_poliinsat_g_total) > 0 && (
                                <div className="bg-white p-2 rounded text-center">
                                  <div className="text-xs text-gray-600">Grasas poli.</div>
                                  <div className="font-bold text-lime-600">{Number(plato.grasas_poliinsat_g_total).toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">g</div>
                                </div>
                              )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Resumen del Formulario de Relevamiento */}
      {visita?.formulario_completado && (
        <Card className="overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b-2 border-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Formulario de Relevamiento</h2>
                <p className="text-sm text-gray-600">Completado el {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Sección 1: Prestación Observada */}
            {visita.formulario_respuestas?.prestacion && (
              <div className="border-2 border-indigo-200 rounded-lg overflow-hidden">
                <div className="bg-indigo-100 px-4 py-3 border-b-2 border-indigo-200">
                  <h3 className="font-bold text-lg text-indigo-900">1. Prestación Observada</h3>
                </div>
                <div className="p-4 bg-white space-y-3">
                  {Object.entries(visita.formulario_respuestas.prestacion).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600 font-medium capitalize flex-1">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 text-right">
                        {typeof value === 'boolean' ? (value ? '✅ Sí' : '❌ No') : value || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sección 2: Cantidad de raciones */}
            {visita.formulario_respuestas?.cantidad && (
              <div className="border-2 border-green-200 rounded-lg overflow-hidden">
                <div className="bg-green-100 px-4 py-3 border-b-2 border-green-200">
                  <h3 className="font-bold text-lg text-green-900">2. Cantidad de Raciones a Elaborar</h3>
                </div>
                <div className="p-4 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full border-2 border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-3 py-2 text-xs font-bold">Becados</th>
                          <th className="border border-gray-300 px-3 py-2 text-xs font-bold">No Becados</th>
                          <th className="border border-gray-300 px-3 py-2 text-xs font-bold">Presentes</th>
                          <th className="border border-gray-300 px-3 py-2 text-xs font-bold">Docentes Autorizados</th>
                          <th className="border border-gray-300 px-3 py-2 text-xs font-bold">Docentes No Autorizados</th>
                          <th className="border border-gray-300 px-3 py-2 text-xs font-bold">Personal Cocina</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                            {visita.formulario_respuestas.cantidad.tabla_raciones_alumnos_becados || '-'}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                            {visita.formulario_respuestas.cantidad.tabla_raciones_alumnos_no_becados || '-'}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                            {visita.formulario_respuestas.cantidad.tabla_raciones_alumnos_presentes || '-'}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                            {visita.formulario_respuestas.cantidad.tabla_raciones_docentes_autorizados || '-'}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                            {visita.formulario_respuestas.cantidad.tabla_raciones_docentes_no_autorizados || '-'}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                            {visita.formulario_respuestas.cantidad.tabla_raciones_personal_cocina || '-'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Sección 3: Control de Temperaturas */}
            {visita.formulario_respuestas?.temperaturas && platos.length > 0 && (
              <div className="border-2 border-orange-200 rounded-lg overflow-hidden">
                <div className="bg-orange-100 px-4 py-3 border-b-2 border-orange-200">
                  <h3 className="font-bold text-lg text-orange-900">3. Control de Temperaturas</h3>
                </div>
                <div className="p-4 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full border-2 border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 font-bold">Alimento</th>
                          <th className="border border-gray-300 px-4 py-2 font-bold">Temp. Conservación (°C)</th>
                          <th className="border border-gray-300 px-4 py-2 font-bold">Temp. Cocción (°C)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {platos.map((plato) => {
                          const tempConservacion = visita.formulario_respuestas.temperaturas[`temp_conservacion_${plato.id}`]
                          const tempCoccion = visita.formulario_respuestas.temperaturas[`temp_coccion_${plato.id}`]
                          if (!tempConservacion && !tempCoccion) return null
                          return (
                            <tr key={plato.id}>
                              <td className="border border-gray-300 px-4 py-2 font-medium">{plato.nombre}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-blue-600">
                                {tempConservacion || '-'}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-red-600">
                                {tempCoccion || '-'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Sección 6: Personal */}
            {visita.formulario_respuestas?.personal && (
              <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
                <div className="bg-purple-100 px-4 py-3 border-b-2 border-purple-200">
                  <h3 className="font-bold text-lg text-purple-900">6. Personal</h3>
                </div>
                <div className="p-4 bg-white space-y-4">
                  {/* Tabla de cantidad de personal */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">6.1 - Cantidad de Personal</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-2 border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 font-bold">Cocinero/a</th>
                            <th className="border border-gray-300 px-4 py-2 font-bold">Ayudantes</th>
                            <th className="border border-gray-300 px-4 py-2 font-bold">Camareros/as</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              {visita.formulario_respuestas.personal.tabla_personal_cocinero || '-'}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              {visita.formulario_respuestas.personal.tabla_personal_ayudantes || '-'}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              {visita.formulario_respuestas.personal.tabla_personal_camareros || '-'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Carnet de manipulador */}
                  <div className="flex justify-between items-center py-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">6.3 - Carnet de Manipulador de Alimentos</span>
                    <span className="text-sm font-semibold">
                      {visita.formulario_respuestas.personal.carnet_manipulador ? '✅ Sí' : '❌ No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sección 7: Equipamiento */}
            {visita.formulario_respuestas?.equipamiento && (
              <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
                <div className="bg-blue-100 px-4 py-3 border-b-2 border-blue-200">
                  <h3 className="font-bold text-lg text-blue-900">7. Equipamiento</h3>
                </div>
                <div className="p-4 bg-white space-y-3">
                  {Object.entries(visita.formulario_respuestas.equipamiento).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600 font-medium capitalize flex-1">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {typeof value === 'boolean' ? (value ? '✅ Sí' : '❌ No') : value || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sección 8: Prácticas de Manipulación */}
            {visita.formulario_respuestas?.practicas_manipulacion && (
              <div className="border-2 border-yellow-200 rounded-lg overflow-hidden">
                <div className="bg-yellow-100 px-4 py-3 border-b-2 border-yellow-200">
                  <h3 className="font-bold text-lg text-yellow-900">8. Prácticas en la Manipulación de Alimentos</h3>
                </div>
                <div className="p-4 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full border-2 border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left font-bold">Práctica</th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-bold">Observado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(visita.formulario_respuestas.practicas_manipulacion)
                          .filter(([key]) => key.startsWith('tabla_practicas_'))
                          .map(([key, value]: [string, any]) => (
                            <tr key={key}>
                              <td className="border border-gray-300 px-4 py-2 text-sm">
                                {key.replace('tabla_practicas_', '').replace(/_/g, ' ')}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                {value === 'si' ? '✅ Sí' : value === 'no' ? '❌ No' : '-'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Sección 9: Higiene de Instalaciones */}
            {visita.formulario_respuestas?.higiene_instalaciones && (
              <div className="border-2 border-teal-200 rounded-lg overflow-hidden">
                <div className="bg-teal-100 px-4 py-3 border-b-2 border-teal-200">
                  <h3 className="font-bold text-lg text-teal-900">9. Higiene y Estado de Instalaciones</h3>
                </div>
                <div className="p-4 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full border-2 border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left font-bold">Área</th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-bold">Higiene</th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-bold">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['sector_cocina', 'sector_comedor', 'instalaciones_comedor', 'instalaciones_cocina', 'desagues', 'contenedores_isotermicos', 'bateria_cocina', 'deposito_viveres', 'equipos_refrigeracion', 'lugar_guardado_efectos'].map((area) => {
                          const higiene = visita.formulario_respuestas.higiene_instalaciones[`tabla_higiene_higiene_${area}`]
                          const estado = visita.formulario_respuestas.higiene_instalaciones[`tabla_higiene_estado_${area}`]
                          if (!higiene && !estado) return null
                          return (
                            <tr key={area}>
                              <td className="border border-gray-300 px-4 py-2 text-sm font-medium">
                                {area.replace(/_/g, ' ')}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                {higiene === 'si' ? '✅' : higiene === 'no' ? '❌' : '-'}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                {estado === 'si' ? '✅' : estado === 'no' ? '❌' : '-'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Sección 10: Infraestructura */}
            {visita.formulario_respuestas?.infraestructura && (
              <div className="border-2 border-pink-200 rounded-lg overflow-hidden">
                <div className="bg-pink-100 px-4 py-3 border-b-2 border-pink-200">
                  <h3 className="font-bold text-lg text-pink-900">10. Infraestructura</h3>
                </div>
                <div className="p-4 bg-white space-y-3">
                  {Object.entries(visita.formulario_respuestas.infraestructura).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600 font-medium capitalize flex-1">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {typeof value === 'boolean' ? (value ? '✅ Sí' : '❌ No') : value || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sección 4: Higiene y Manipulación */}
            {visita.formulario_respuestas?.higiene && (
              <div className="border-2 border-red-200 rounded-lg overflow-hidden">
                <div className="bg-red-100 px-4 py-3 border-b-2 border-red-200">
                  <h3 className="font-bold text-lg text-red-900">4. Higiene y Manipulación</h3>
                </div>
                <div className="p-4 bg-white space-y-3">
                  {Object.entries(visita.formulario_respuestas.higiene).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600 font-medium capitalize flex-1">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {typeof value === 'boolean' ? (value ? '✅ Sí' : '❌ No') : value || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sección: Hábitos Higiénicos */}
            {visita.formulario_respuestas?.habitos_higienicos && (
              <div className="border-2 border-cyan-200 rounded-lg overflow-hidden">
                <div className="bg-cyan-100 px-4 py-3 border-b-2 border-cyan-200">
                  <h3 className="font-bold text-lg text-cyan-900">7. Hábitos Higiénicos</h3>
                </div>
                <div className="p-4 bg-white space-y-3">
                  {Object.entries(visita.formulario_respuestas.habitos_higienicos).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600 font-medium capitalize flex-1">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {typeof value === 'boolean' ? (value ? '✅ Sí' : '❌ No') : value || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Modal isOpen={isPlatoModalOpen} onClose={() => setIsPlatoModalOpen(false)} title="Agregar Plato">
        <form onSubmit={handleCreatePlato} className="space-y-4">
          <Input
            label="Nombre del Plato"
            required
            value={platoForm.nombre}
            onChange={(e) => setPlatoForm({ ...platoForm, nombre: e.target.value })}
          />
          <Select
            label="Tipo de Plato"
            options={tipoPlatoOptions}
            value={platoForm.tipo_plato}
            onChange={(e) => setPlatoForm({ ...platoForm, tipo_plato: e.target.value })}
          />
          <Input
            label="Porciones Servidas"
            type="number"
            value={platoForm.porciones_servidas}
            onChange={(e) => setPlatoForm({ ...platoForm, porciones_servidas: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              value={platoForm.notas}
              onChange={(e) => setPlatoForm({ ...platoForm, notas: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={() => setIsPlatoModalOpen(false)} className="bg-gray-500 hover:bg-gray-600">
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isIngredienteModalOpen} onClose={() => setIsIngredienteModalOpen(false)} title="Agregar Ingrediente">
        <form onSubmit={handleAddIngrediente} className="space-y-4">
          <div>
            <Input
              label="Buscar Alimento"
              placeholder="Escriba para buscar..."
              value={searchAlimento}
              onChange={(e) => setSearchAlimento(e.target.value)}
            />
            {alimentos.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border rounded">
                {alimentos.map((alimento) => (
                  <div
                    key={alimento.id}
                    onClick={() => {
                      setIngredienteForm({ ...ingredienteForm, alimento: alimento.id })
                      setSearchAlimento(alimento.nombre)
                      setAlimentos([])
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <p className="font-medium">{alimento.nombre}</p>
                    <p className="text-xs text-gray-600">{alimento.categoria_nombre}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Input
            label="Cantidad"
            type="number"
            step="0.1"
            required
            value={ingredienteForm.cantidad}
            onChange={(e) => setIngredienteForm({ ...ingredienteForm, cantidad: e.target.value })}
          />
          <Select
            label="Unidad"
            options={[
              { value: 'g', label: 'gramos (g)' },
              { value: 'ml', label: 'mililitros (ml)' },
            ]}
            value={ingredienteForm.unidad}
            onChange={(e) => setIngredienteForm({ ...ingredienteForm, unidad: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => {
                setIsIngredienteModalOpen(false)
                setSearchAlimento('')
              }}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!ingredienteForm.alimento}>
              Agregar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
