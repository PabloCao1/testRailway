import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export const FormularioRelevamientoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [seccionActual, setSeccionActual] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, any>>({})
  const [platos, setPlatos] = useState<any[]>([])
  const [platosSeleccionados, setPlatosSeleccionados] = useState<number[]>([])

  const secciones = [
    {
      id: 'prestacion',
      titulo: '1. Prestación Observada',
      preguntas: [
        { id: 'tipo_prestacion', tipo: 'select', label: '1.1 - Tipo de prestación', opciones: ['Desayuno / Merienda', 'Almuerzo: Comedor', 'Almuerzo: Vianda Fría', 'Almuerzo: Vianda Caliente', 'Refuerzo Alimentario (1 o 2)', 'Complemento'] },
        { id: 'menu_tipo', tipo: 'text', label: 'Menú' },
        { id: 'docentes_no_autorizados', tipo: 'boolean', label: '1.3.1 - ¿Docentes no autorizados y alumnos no becados, consumen el mismo menú?' },
        { id: 'mosaico_exhibido', tipo: 'boolean', label: '1.3.2 - ¿El mosaico de menú se encuentra exhibido? (Art. 7°)' },
        { id: 'corresponde_pbc', tipo: 'boolean', label: '1.3.3 - ¿Corresponde al vigente según el PBC? (Anexo A)' },
        { id: 'existe_modificacion', tipo: 'boolean', label: '1.3.4 - ¿Existe alguna modificación? (Art. 8°)' },
        { id: 'modificacion_cual', tipo: 'text', label: '¿Cuál?', dependeDe: 'existe_modificacion' },
        { id: 'menu_patologia_aguda', tipo: 'boolean', label: '1.3.5 - ¿Se indica algún menú especial para patología aguda? (Art. 8°)' },
        { id: 'patologia_aguda_cual', tipo: 'text', label: '¿Cuál/es?', dependeDe: 'menu_patologia_aguda' },
        { id: 'patologia_aguda_prescripcion', tipo: 'boolean', label: '1.3.6 - ¿Posee prescripción médica?', dependeDe: 'menu_patologia_aguda' },
        { id: 'patologia_aguda_cuantos', tipo: 'number', label: '¿Cuántos?', dependeDe: 'patologia_aguda_prescripcion' },
        { id: 'menu_patologia_cronica', tipo: 'boolean', label: '1.3.7 - ¿Se indica algún menú especial para patología crónica?' },
        { id: 'patologia_cronica_cual', tipo: 'text', label: '¿Cuál/es?', dependeDe: 'menu_patologia_cronica' },
        { id: 'patologia_cronica_prescripcion', tipo: 'boolean', label: '1.3.8 - ¿Posee prescripción médica?', dependeDe: 'menu_patologia_cronica' },
        { id: 'patologia_cronica_cuantos', tipo: 'number', label: '¿Cuántos?', dependeDe: 'patologia_cronica_prescripcion' },
        { id: 'sobrantes_desechados', tipo: 'boolean', label: '1.3.9 - ¿Los sobrantes de alimentos son desechados?' }
      ]
    },
    {
      id: 'cantidad',
      titulo: '2. Cantidad de raciones a elaborar',
      preguntas: [
        { id: 'tabla_raciones', tipo: 'tabla', label: 'Cantidad de raciones', columnas: [
          { id: 'alumnos_becados', label: 'Becados' },
          { id: 'alumnos_no_becados', label: 'No Becados' },
          { id: 'alumnos_presentes', label: 'Presentes' },
          { id: 'docentes_autorizados', label: 'Autorizados' },
          { id: 'docentes_no_autorizados', label: 'No Autorizados' },
          { id: 'personal_cocina', label: 'Personal de cocina' }
        ]}
      ]
    },
    {
      id: 'temperaturas',
      titulo: '3. Control de temperaturas durante el proceso',
      preguntas: [
        { id: 'tabla_temperaturas', tipo: 'tabla_platos', label: 'Control de temperaturas' }
      ]
    },
    {
      id: 'personal',
      titulo: '6. Personal',
      preguntas: [
        { 
          id: 'tabla_personal', 
          tipo: 'tabla_personal', 
          label: '6.1 - La cantidad de personal deberá garantizar la correcta elaboración y servicio en tiempo y forma (Art. 25)',
          columnas: [
            { id: 'cocinero', label: 'Cocinero /a' },
            { id: 'ayudantes', label: 'Ayudantes' },
            { id: 'camareros', label: 'Camareros /as' }
          ]
        },
        { 
          id: 'tabla_indumentaria', 
          tipo: 'tabla_indumentaria', 
          label: '6.2 - Indumentaria (Art 27)',
          filas: [
            { id: 'guardapolvo', label: 'Guardapolvo o Ambos' },
            { id: 'delantal', label: 'Delantal (lona)' },
            { id: 'cofia', label: 'Cofia o birrete' },
            { id: 'barbijo', label: 'Barbijo en manipuladores de alimentos listos para consumir' },
            { id: 'guantes', label: 'Guantes descartables en manipuladores de alimentos listos para consumir' },
            { id: 'identificacion', label: 'Identificación (Art 28)' },
            { id: 'ropa_clara', label: 'Ropa clara' },
            { id: 'ropa_limpia', label: 'Ropa limpia' },
            { id: 'calzado', label: 'Calzado cerrado y antideslizante' }
          ],
          columnas: [
            { id: 'cocinero', label: 'Cocinero / a' },
            { id: 'ayudantes', label: 'Ayudantes' },
            { id: 'camareros', label: 'Camareros' }
          ]
        },
        { id: 'carnet_manipulador', tipo: 'boolean', label: '6.3 - Carnet de Manipulador de Alimentos emitido por la DGHySA (Art 29 – Art 21 del CAA)' }
      ]
    },
    {
      id: 'equipamiento',
      titulo: '7. Equipamiento',
      preguntas: [
        { id: 'posee_balanza', tipo: 'boolean', label: '5.1 - El establecimiento escolar posee una balanza con una capacidad mínima de un (1) Kg. con sensibilidad de hasta diez (10) gramos.' },
        { id: 'posee_termometro', tipo: 'boolean', label: '5.2 - El establecimiento escolar posee un termómetro pincha carne, con vástago, digital o electrónico en buen estado de funcionamiento (Art. 34).' }
      ]
    },
    {
      id: 'habitos_higienicos',
      titulo: '7. Hábitos Higiénicos en el proceso de elaboración y servicio de alimentos',
      preguntas: [
        { id: 'avisos_lavado_manos', tipo: 'boolean', label: '7.1 - Existencia de avisos de lavado de manos en el área de preparación y elaboración y de alimentos. (CAA, Capítulo II, Disposiciones generales de fábricas y comercios, locales y establecimientos, año 2004)' },
        { id: 'recipientes_tapa_residuos', tipo: 'boolean', label: '7.2 - Existencia de recipientes con tapa para colocar los residuos en el área de preparación, elaboración y servicio de alimentos (CAA, Capítulo II, Disposiciones generales de fábricas y comercios, locales y establecimientos, año 2004)' },
        { id: 'cestos_diferenciados', tipo: 'boolean', label: '7.3 - Existencia de cestos de basura y reciclables que sean diferentes y diferenciados con su leyenda descriptiva de "Basura" y "Reciclables"' },
        { id: 'elementos_limpieza_separados', tipo: 'boolean', label: '7.4 - Almacenamiento de elementos de limpieza separados de los alimentos y de la vajilla (CAA, Capítulo II, Disposiciones generales de fábricas y comercios, locales y establecimientos, año 2004) Anexo B punto 4.4 y Anexo C punto 4.2' }
      ]
    },
    {
      id: 'practicas_manipulacion',
      titulo: '8. Prácticas en la manipulación de los alimentos – Anexo B y C',
      preguntas: [
        { 
          id: 'tabla_practicas', 
          tipo: 'tabla_practicas', 
          label: 'Prácticas en la manipulación de alimentos',
          filas: [
            { id: 'mezclan_crudos_cocidos', label: 'Se mezclan alimentos crudos con cocidos' },
            { id: 'utensilios_sin_higiene', label: 'Se utilizan utensilios (tablas, cubiertos) indistintamente sin previo proceso de higiene para manipular alimentos crudos y cocidos' },
            { id: 'heladeras_protegidas', label: 'Los alimentos se conservan en heladeras y/o cámaras protegidos contra contaminación y rotulados' },
            { id: 'temperaturas_adecuadas', label: 'Los alimentos se conservan en las temperaturas adecuadas según el tipo de alimento' },
            { id: 'diagramas_flujo', label: 'Posee diagramas de flujo de elaboración con indicación de PCC' },
            { id: 'sanitizado_alimentos', label: 'Se aplican técnicas de sanitizado de alimentos que se consuman sin cocción' },
            { id: 'registro_temperaturas', label: 'Se registran temperaturas de enfriamiento y/o cocción – control de proceso -' }
          ]
        }
      ]
    },
    {
      id: 'higiene_instalaciones',
      titulo: '9. Higiene y estado de las Instalaciones y equipos',
      preguntas: [
        { 
          id: 'tabla_higiene', 
          tipo: 'tabla_higiene', 
          label: 'Higiene y estado de las instalaciones',
          filas: [
            { id: 'sector_cocina', label: 'Sector Cocina' },
            { id: 'sector_comedor', label: 'Sector Comedor' },
            { id: 'instalaciones_comedor', label: 'Instalaciones del comedor' },
            { id: 'instalaciones_cocina', label: 'Instalaciones de la cocina' },
            { id: 'desagues', label: 'Desagües' },
            { id: 'contenedores_isotermicos', label: 'Contenedores isotérmicos' },
            { id: 'bateria_cocina', label: 'Batería de cocina' },
            { id: 'deposito_viveres', label: 'Depósito de víveres secos' },
            { id: 'equipos_refrigeracion', label: 'Equipos de refrigeración' },
            { id: 'lugar_guardado_efectos', label: 'Lugar de guardado de efectos personales' }
          ]
        }
      ]
    },
    {
      id: 'infraestructura',
      titulo: '10. Infraestructura',
      preguntas: [
        { id: 'cielorraso', tipo: 'boolean', label: 'El cielorraso es liso, no poroso y lavable' },
        { id: 'piso_antideslizante', tipo: 'boolean', label: 'Los pisos son antideslizantes y lavables' },
        { id: 'ventilacion', tipo: 'boolean', label: 'Hay ventilación adecuada' },
        { id: 'iluminacion', tipo: 'boolean', label: 'La iluminación es suficiente' }
      ]
    },
    {
      id: 'higiene',
      titulo: '4. Higiene y manipulación',
      preguntas: [
        { id: 'lavado_manos', tipo: 'boolean', label: 'El personal se lava las manos correctamente' },
        { id: 'uso_cofia', tipo: 'boolean', label: 'El personal usa cofia o gorro' },
        { id: 'uso_delantal', tipo: 'boolean', label: 'El personal usa delantal limpio' },
        { id: 'unas_cortas', tipo: 'boolean', label: 'El personal tiene uñas cortas y sin esmalte' }
      ]
    }
  ]

  const handleRespuesta = (preguntaId: string, valor: any) => {
    setRespuestas({ ...respuestas, [preguntaId]: valor })
  }

  const togglePlato = (platoId: number) => {
    if (platosSeleccionados.includes(platoId)) {
      setPlatosSeleccionados(platosSeleccionados.filter(id => id !== platoId))
    } else {
      setPlatosSeleccionados([...platosSeleccionados, platoId])
    }
  }

  // Cargar platos de la visita
  React.useEffect(() => {
    const cargarPlatos = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/auditoria/visitas/${id}/`)
        const data = await response.json()
        if (data.platos) {
          setPlatos(data.platos)
        }
      } catch (error) {
        console.error('Error cargando platos:', error)
      }
    }
    cargarPlatos()
  }, [id])

  const seccionCompleta = () => {
    const preguntasSeccion = secciones[seccionActual].preguntas
    return preguntasSeccion.every(p => respuestas[p.id] !== undefined)
  }

  const handleGuardar = async () => {
    try {
      // Agrupar respuestas por sección
      const respuestasPorSeccion: Record<string, any> = {}
      secciones.forEach(seccion => {
        respuestasPorSeccion[seccion.id] = {}
        seccion.preguntas.forEach(pregunta => {
          if (respuestas[pregunta.id] !== undefined) {
            respuestasPorSeccion[seccion.id][pregunta.id] = respuestas[pregunta.id]
          }
        })
      })

      // Simular guardado (aquí deberías hacer un PUT a la API)
      console.log('Guardando respuestas:', respuestasPorSeccion)
      localStorage.setItem(`formulario_visita_${id}`, JSON.stringify(respuestasPorSeccion))
      
      alert('Formulario guardado exitosamente')
      navigate(`/visitas/${id}`)
    } catch (error) {
      console.error('Error guardando formulario:', error)
      alert('Error al guardar el formulario')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Formulario de Relevamiento Nutricional</h1>
            <p className="text-indigo-100 mt-1">Visita #{id}</p>
          </div>
          <Button onClick={() => navigate(`/visitas/${id}`)} className="bg-white/20 hover:bg-white/30">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar de navegación */}
          <div className="col-span-3">
            <Card className="sticky top-6">
              <h3 className="font-bold text-lg mb-4">Secciones</h3>
              <nav className="space-y-2">
                {secciones.map((seccion, index) => (
                  <button
                    key={seccion.id}
                    onClick={() => setSeccionActual(index)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      seccionActual === index
                        ? 'bg-indigo-100 text-indigo-700 font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{seccion.titulo}</span>
                      {seccion.preguntas.every(p => respuestas[p.id] !== undefined) && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Contenido del formulario */}
          <div className="col-span-9">
            <Card>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {secciones[seccionActual].titulo}
              </h2>

              <div className="space-y-6">
                {secciones[seccionActual].preguntas.map((pregunta) => {
                  // Verificar si la pregunta depende de otra
                  if (pregunta.dependeDe && !respuestas[pregunta.dependeDe]) {
                    return null
                  }
                  
                  return (
                  <div key={pregunta.id} className="border-b pb-6 last:border-b-0">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {pregunta.label}
                    </label>

                    {pregunta.tipo === 'text' && (
                      <input
                        type="text"
                        value={respuestas[pregunta.id] || ''}
                        onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                        placeholder="Ingrese su respuesta"
                      />
                    )}

                    {pregunta.tipo === 'boolean' && (
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleRespuesta(pregunta.id, true)}
                          className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            respuestas[pregunta.id] === true
                              ? 'bg-green-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          ✓ Sí
                        </button>
                        <button
                          onClick={() => handleRespuesta(pregunta.id, false)}
                          className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            respuestas[pregunta.id] === false
                              ? 'bg-red-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          ✗ No
                        </button>
                      </div>
                    )}

                    {pregunta.tipo === 'select' && (
                      <select
                        value={respuestas[pregunta.id] || ''}
                        onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="">Seleccionar...</option>
                        {pregunta.opciones?.map((opcion) => (
                          <option key={opcion} value={opcion}>
                            {opcion}
                          </option>
                        ))}
                      </select>
                    )}

                    {pregunta.tipo === 'number' && (
                      <input
                        type="number"
                        value={respuestas[pregunta.id] || ''}
                        onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                        placeholder="Ingrese un número"
                      />
                    )}

                    {pregunta.tipo === 'tabla_platos' && (
                      <div className="space-y-4">
                        {/* Selector de platos */}
                        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                          <h4 className="font-semibold text-gray-800 mb-3">Seleccione los platos a controlar:</h4>
                          <div className="space-y-2">
                            {platos.length === 0 ? (
                              <p className="text-gray-500 text-sm">No hay platos registrados en esta visita</p>
                            ) : (
                              platos.map((plato) => (
                                <label key={plato.id} className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded">
                                  <input
                                    type="checkbox"
                                    checked={platosSeleccionados.includes(plato.id)}
                                    onChange={() => togglePlato(plato.id)}
                                    className="w-5 h-5 text-blue-600"
                                  />
                                  <span className="font-medium text-gray-700">{plato.nombre}</span>
                                  <span className="text-xs text-gray-500">({plato.tipo_plato})</span>
                                </label>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Tabla de temperaturas */}
                        {platosSeleccionados.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="w-full border-2 border-gray-800">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold">
                                    Alimento
                                  </th>
                                  <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold">
                                    Temperatura de conservación°
                                  </th>
                                  <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold">
                                    Temperatura de cocción°
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {platosSeleccionados.map((platoId) => {
                                  const plato = platos.find(p => p.id === platoId)
                                  return (
                                    <tr key={platoId}>
                                      <td className="border-2 border-gray-800 px-4 py-3 font-medium">
                                        {plato?.nombre}
                                      </td>
                                      <td className="border-2 border-gray-800 px-2 py-2">
                                        <input
                                          type="number"
                                          step="0.1"
                                          value={respuestas[`temp_conservacion_${platoId}`] || ''}
                                          onChange={(e) => handleRespuesta(`temp_conservacion_${platoId}`, e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:border-indigo-500 focus:outline-none"
                                          placeholder="°C"
                                        />
                                      </td>
                                      <td className="border-2 border-gray-800 px-2 py-2">
                                        <input
                                          type="number"
                                          step="0.1"
                                          value={respuestas[`temp_coccion_${platoId}`] || ''}
                                          onChange={(e) => handleRespuesta(`temp_coccion_${platoId}`, e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:border-indigo-500 focus:outline-none"
                                          placeholder="°C"
                                        />
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {pregunta.tipo === 'tabla_personal' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-2 border-gray-800">
                          <thead>
                            <tr className="bg-gray-100">
                              {pregunta.columnas?.map((col: any) => (
                                <th key={col.id} className="border-2 border-gray-800 px-4 py-3 text-center font-bold">
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {pregunta.columnas?.map((col: any) => (
                                <td key={col.id} className="border-2 border-gray-800 px-2 py-2">
                                  <input
                                    type="number"
                                    value={respuestas[`${pregunta.id}_${col.id}`] || ''}
                                    onChange={(e) => handleRespuesta(`${pregunta.id}_${col.id}`, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:border-indigo-500 focus:outline-none"
                                    placeholder="0"
                                  />
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {pregunta.tipo === 'tabla_indumentaria' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-2 border-gray-800">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold">
                                Vestimenta
                              </th>
                              <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold" colSpan={3}>
                                Personas afectadas
                              </th>
                            </tr>
                            <tr className="bg-gray-50">
                              <th className="border-2 border-gray-800 px-4 py-2"></th>
                              {pregunta.columnas?.map((col: any) => (
                                <th key={col.id} className="border-2 border-gray-800 px-4 py-2 text-center font-semibold">
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {pregunta.filas?.map((fila: any) => (
                              <tr key={fila.id}>
                                <td className="border-2 border-gray-800 px-4 py-3 font-medium bg-gray-50">
                                  {fila.label}
                                </td>
                                {pregunta.columnas?.map((col: any) => (
                                  <td key={col.id} className="border-2 border-gray-800 px-2 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={respuestas[`${pregunta.id}_${fila.id}_${col.id}`] || false}
                                      onChange={(e) => handleRespuesta(`${pregunta.id}_${fila.id}_${col.id}`, e.target.checked)}
                                      className="w-5 h-5 text-indigo-600 cursor-pointer"
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {pregunta.tipo === 'tabla_practicas' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-2 border-gray-800">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold w-1/2">
                                Prácticas en la manipulación de alimentos
                              </th>
                              <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold w-1/2">
                                Durante el proceso de elaboración y/o servicio de la prestación
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pregunta.filas?.map((fila: any) => (
                              <tr key={fila.id}>
                                <td className="border-2 border-gray-800 px-4 py-3 text-left">
                                  {fila.label}
                                </td>
                                <td className="border-2 border-gray-800 px-4 py-3 text-center">
                                  <div className="flex justify-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`${pregunta.id}_${fila.id}`}
                                        value="si"
                                        checked={respuestas[`${pregunta.id}_${fila.id}`] === 'si'}
                                        onChange={(e) => handleRespuesta(`${pregunta.id}_${fila.id}`, e.target.value)}
                                        className="w-4 h-4 text-green-600"
                                      />
                                      <span className="font-medium">Sí</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`${pregunta.id}_${fila.id}`}
                                        value="no"
                                        checked={respuestas[`${pregunta.id}_${fila.id}`] === 'no'}
                                        onChange={(e) => handleRespuesta(`${pregunta.id}_${fila.id}`, e.target.value)}
                                        className="w-4 h-4 text-red-600"
                                      />
                                      <span className="font-medium">No</span>
                                    </label>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {pregunta.tipo === 'tabla_higiene' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-2 border-gray-800">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold" rowSpan={2}>
                                Áreas Evaluadas
                              </th>
                              <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold" colSpan={2}>
                                Higiene Adecuada
                              </th>
                              <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold" colSpan={2}>
                                Estado Adecuado
                              </th>
                            </tr>
                            <tr className="bg-gray-50">
                              <th className="border-2 border-gray-800 px-4 py-2 text-center font-semibold">Sí</th>
                              <th className="border-2 border-gray-800 px-4 py-2 text-center font-semibold">No</th>
                              <th className="border-2 border-gray-800 px-4 py-2 text-center font-semibold">Sí</th>
                              <th className="border-2 border-gray-800 px-4 py-2 text-center font-semibold">No</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pregunta.filas?.map((fila: any) => (
                              <tr key={fila.id}>
                                <td className="border-2 border-gray-800 px-4 py-3 text-left font-medium">
                                  {fila.label}
                                </td>
                                <td className="border-2 border-gray-800 px-2 py-3 text-center">
                                  <input
                                    type="radio"
                                    name={`${pregunta.id}_higiene_${fila.id}`}
                                    value="si"
                                    checked={respuestas[`${pregunta.id}_higiene_${fila.id}`] === 'si'}
                                    onChange={(e) => handleRespuesta(`${pregunta.id}_higiene_${fila.id}`, e.target.value)}
                                    className="w-4 h-4 cursor-pointer"
                                  />
                                </td>
                                <td className="border-2 border-gray-800 px-2 py-3 text-center">
                                  <input
                                    type="radio"
                                    name={`${pregunta.id}_higiene_${fila.id}`}
                                    value="no"
                                    checked={respuestas[`${pregunta.id}_higiene_${fila.id}`] === 'no'}
                                    onChange={(e) => handleRespuesta(`${pregunta.id}_higiene_${fila.id}`, e.target.value)}
                                    className="w-4 h-4 cursor-pointer"
                                  />
                                </td>
                                <td className="border-2 border-gray-800 px-2 py-3 text-center">
                                  <input
                                    type="radio"
                                    name={`${pregunta.id}_estado_${fila.id}`}
                                    value="si"
                                    checked={respuestas[`${pregunta.id}_estado_${fila.id}`] === 'si'}
                                    onChange={(e) => handleRespuesta(`${pregunta.id}_estado_${fila.id}`, e.target.value)}
                                    className="w-4 h-4 cursor-pointer"
                                  />
                                </td>
                                <td className="border-2 border-gray-800 px-2 py-3 text-center">
                                  <input
                                    type="radio"
                                    name={`${pregunta.id}_estado_${fila.id}`}
                                    value="no"
                                    checked={respuestas[`${pregunta.id}_estado_${fila.id}`] === 'no'}
                                    onChange={(e) => handleRespuesta(`${pregunta.id}_estado_${fila.id}`, e.target.value)}
                                    className="w-4 h-4 cursor-pointer"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {pregunta.tipo === 'tabla' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-2 border-gray-800">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold" rowSpan={2}>
                                Alumnos según matrícula
                              </th>
                              <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold" colSpan={3}>
                                Alumnos
                              </th>
                              <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold" colSpan={2}>
                                Docentes
                              </th>
                              <th className="border-2 border-gray-800 px-4 py-3 text-center font-bold" rowSpan={2}>
                                Personal de cocina
                              </th>
                            </tr>
                            <tr className="bg-gray-100">
                              <th className="border-2 border-gray-800 px-4 py-2 text-center font-semibold">Becados</th>
                              <th className="border-2 border-gray-800 px-4 py-2 text-center font-semibold">No Becados</th>
                              <th className="border-2 border-gray-800 px-4 py-2 text-center font-semibold">Presentes</th>
                              <th className="border-2 border-gray-800 px-4 py-2 text-center font-semibold">Autorizados</th>
                              <th className="border-2 border-gray-800 px-4 py-2 text-center font-semibold">No Autorizados</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border-2 border-gray-800 px-4 py-3 bg-gray-50"></td>
                              {pregunta.columnas?.map((col: any) => (
                                <td key={col.id} className="border-2 border-gray-800 px-2 py-2">
                                  <input
                                    type="number"
                                    value={respuestas[`${pregunta.id}_${col.id}`] || ''}
                                    onChange={(e) => handleRespuesta(`${pregunta.id}_${col.id}`, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:border-indigo-500 focus:outline-none"
                                    placeholder="0"
                                  />
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  )
                })}
              </div>

              {/* Navegación entre secciones */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  onClick={() => setSeccionActual(Math.max(0, seccionActual - 1))}
                  disabled={seccionActual === 0}
                  className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50"
                >
                  ← Anterior
                </Button>

                {seccionActual < secciones.length - 1 ? (
                  <Button
                    onClick={() => setSeccionActual(seccionActual + 1)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Siguiente →
                  </Button>
                ) : (
                  <Button
                    onClick={handleGuardar}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    💾 Guardar Formulario
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
