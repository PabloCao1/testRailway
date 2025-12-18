import React, { useState, useEffect } from 'react'
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { reportesService } from '../services/reportesService'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'

interface Filtro {
  id: string
  campo: string
  operador: string
  valor: string
}

export const ReporteInstitucionPage: React.FC = () => {
  const navigate = useNavigate()
  const [filtros, setFiltros] = useState<Filtro[]>([])
  const [resultados, setResultados] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  const camposFormulario = [
    { value: 'tipo_prestacion', label: 'Tipo de Prestación' },
    { value: 'mosaico_exhibido', label: 'Mosaico Exhibido' },
    { value: 'corresponde_pbc', label: 'Corresponde PBC' },
    { value: 'existe_modificacion', label: 'Existe Modificación' },
    { value: 'menu_patologia_aguda', label: 'Menú Patología Aguda' },
    { value: 'menu_patologia_cronica', label: 'Menú Patología Crónica' },
    { value: 'posee_balanza', label: 'Posee Balanza' },
    { value: 'posee_termometro', label: 'Posee Termómetro' },
    { value: 'carnet_manipulador', label: 'Carnet Manipulador' },
    { value: 'lavado_manos', label: 'Lavado de Manos' },
    { value: 'uso_cofia', label: 'Uso de Cofia' },
    { value: 'uso_delantal', label: 'Uso de Delantal' },
    { value: 'tipo_institucion', label: 'Tipo de Institución' },
    { value: 'tipo_comida', label: 'Tipo de Comida' },
  ]

  const agregarFiltro = () => {
    setFiltros([...filtros, { id: Date.now().toString(), campo: '', operador: '=', valor: '' }])
  }

  const eliminarFiltro = (id: string) => {
    setFiltros(filtros.filter(f => f.id !== id))
  }

  const actualizarFiltro = (id: string, key: keyof Filtro, value: string) => {
    setFiltros(filtros.map(f => f.id === id ? { ...f, [key]: value } : f))
  }

  const generarReporte = async () => {
    try {
      setLoading(true)
      // Construir query params
      const params: any = {}
      if (fechaInicio) params.fecha_inicio = fechaInicio
      if (fechaFin) params.fecha_fin = fechaFin
      
      filtros.forEach((filtro, index) => {
        if (filtro.campo && filtro.valor) {
          params[`filtro_${index}_campo`] = filtro.campo
          params[`filtro_${index}_valor`] = filtro.valor
        }
      })

      const data = await reportesService.getReporteConFiltros(params)
      setResultados(data)
    } catch (error) {
      console.error('Error generando reporte:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <Button onClick={() => navigate('/dashboard')} className="mb-4 bg-gray-500 hover:bg-gray-600">
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver
      </Button>

      <h1 className="text-2xl font-bold mb-6">Reporte de Instituciones con Filtros</h1>

      <Card className="mb-6">
        <h3 className="font-semibold mb-4">Filtros de Búsqueda</h3>
        
        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Fecha Inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            placeholder="dd/mm/aaaa"
          />
          <Input
            label="Fecha Fin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            placeholder="dd/mm/aaaa"
          />
        </div>

        {/* Filtros Dinámicos */}
        <div className="space-y-3 mb-4">
          {filtros.map((filtro) => (
            <div key={filtro.id} className="flex gap-3 items-end">
              <div className="flex-1">
                <Select
                  label="Campo del Formulario"
                  options={[
                    { value: '', label: 'Seleccione...' },
                    ...camposFormulario,
                  ]}
                  value={filtro.campo}
                  onChange={(e) => actualizarFiltro(filtro.id, 'campo', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Valor"
                  value={filtro.valor}
                  onChange={(e) => actualizarFiltro(filtro.id, 'valor', e.target.value)}
                  placeholder="Ingrese valor"
                />
              </div>
              <Button
                onClick={() => eliminarFiltro(filtro.id)}
                className="bg-red-500 hover:bg-red-600 px-3"
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <Button onClick={agregarFiltro} className="bg-blue-500 hover:bg-blue-600">
            <PlusIcon className="w-5 h-5 mr-2" />
            Agregar Filtro
          </Button>
          <Button onClick={generarReporte} className="bg-green-600 hover:bg-green-700">
            Generar Reporte
          </Button>
        </div>
      </Card>

      {loading && <p className="text-center py-8">Cargando reporte...</p>}

      {/* Tabla de Resultados */}
      {resultados.length > 0 && (
        <Card>
          <h3 className="font-semibold mb-4">Resultados ({resultados.length} instituciones)</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Institución</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Visitas</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Cumple Criterios</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((inst) => (
                  <tr key={inst.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{inst.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{inst.codigo}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                        {inst.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{inst.total_visitas || 0}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        inst.cumple_criterios ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {inst.cumple_criterios ? '✓ Sí' : '⚠ Parcial'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        onClick={() => navigate(`/reportes/instituciones/${inst.id}`)}
                        className="text-sm px-3 py-1"
                      >
                        Ver Detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && resultados.length === 0 && filtros.length > 0 && (
        <Card>
          <p className="text-center text-gray-500 py-8">
            No se encontraron instituciones que cumplan con los criterios seleccionados.
          </p>
        </Card>
      )}
    </div>
  )
}
