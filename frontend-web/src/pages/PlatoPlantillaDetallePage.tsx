import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { auditoriaService, PlatoPlantilla, IngredientePlantilla } from '../services/auditoriaService'
import { nutricionService, AlimentoNutricional } from '../services/nutricionService'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'

export default function PlatoPlantillaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [plato, setPlato] = useState<PlatoPlantilla | null>(null)
  const [ingredientes, setIngredientes] = useState<IngredientePlantilla[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchAlimento, setSearchAlimento] = useState('')
  const [alimentos, setAlimentos] = useState<AlimentoNutricional[]>([])
  const [selectedAlimento, setSelectedAlimento] = useState<AlimentoNutricional | null>(null)
  const [cantidad, setCantidad] = useState('')

  useEffect(() => {
    if (id) {
      loadPlato()
      loadIngredientes()
    }
  }, [id])

  const loadPlato = async () => {
    try {
      const data = await auditoriaService.getPlatoPlantilla(Number(id))
      setPlato(data)
    } catch (error) {
      console.error('Error al cargar plato:', error)
    }
  }

  const loadIngredientes = async () => {
    try {
      setLoading(true)
      const data = await auditoriaService.getIngredientesPlantilla({ plato_plantilla: Number(id) })
      setIngredientes(data.results || [])
    } catch (error) {
      console.error('Error al cargar ingredientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchAlimentos = async (term: string) => {
    if (term.length < 2) {
      setAlimentos([])
      return
    }
    try {
      const data = await nutricionService.getAlimentos({ search: term })
      setAlimentos(data.results || [])
    } catch (error) {
      console.error('Error al buscar alimentos:', error)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchAlimentos(searchAlimento)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchAlimento])

  const handleOpenModal = () => {
    setShowModal(true)
    setSearchAlimento('')
    setSelectedAlimento(null)
    setCantidad('')
    setAlimentos([])
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleSelectAlimento = (alimento: AlimentoNutricional) => {
    setSelectedAlimento(alimento)
    setSearchAlimento(alimento.nombre)
    setAlimentos([])
  }

  const handleAddIngrediente = async () => {
    if (!selectedAlimento || !cantidad) {
      alert('Seleccione un alimento e ingrese la cantidad')
      return
    }

    try {
      await auditoriaService.createIngredientePlantilla({
        plato_plantilla: Number(id),
        alimento: selectedAlimento.id,
        cantidad: parseFloat(cantidad),
        unidad: 'g',
      })
      handleCloseModal()
      loadIngredientes()
      loadPlato()
    } catch (error) {
      console.error('Error al agregar ingrediente:', error)
      alert('Error al agregar ingrediente')
    }
  }

  const handleDeleteIngrediente = async (ingredienteId: number) => {
    if (!confirm('¿Eliminar este ingrediente?')) return
    try {
      await auditoriaService.deleteIngredientePlantilla(ingredienteId)
      loadIngredientes()
      loadPlato()
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  }

  const handleRecalcular = async () => {
    try {
      await auditoriaService.recalcularPlatoPlantilla(Number(id))
      loadPlato()
      alert('Totales recalculados correctamente')
    } catch (error) {
      console.error('Error al recalcular:', error)
    }
  }

  if (!plato) return <div className="p-6">Cargando...</div>

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Button variant="secondary" onClick={() => navigate('/platos-plantilla')} className="mb-4">
          ← Volver
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{plato.nombre}</h1>
        <p className="text-gray-600">{plato.descripcion}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <h3 className="font-semibold mb-2">Energía</h3>
          <p className="text-2xl font-bold text-blue-600">{Number(plato.energia_kcal_total || 0).toFixed(0)} kcal</p>
        </Card>
        <Card>
          <h3 className="font-semibold mb-2">Proteínas</h3>
          <p className="text-2xl font-bold text-green-600">{Number(plato.proteinas_g_total || 0).toFixed(1)} g</p>
        </Card>
        <Card>
          <h3 className="font-semibold mb-2">Carbohidratos</h3>
          <p className="text-2xl font-bold text-orange-600">{Number(plato.carbohidratos_g_total || 0).toFixed(1)} g</p>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ingredientes</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleRecalcular}>
              Recalcular
            </Button>
            <Button onClick={handleOpenModal}>+ Agregar Ingrediente</Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Cargando ingredientes...</div>
        ) : ingredientes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay ingredientes. Agregue el primero.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Alimento</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Cantidad</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ingredientes.map((ing) => (
                  <tr key={ing.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{ing.alimento_nombre}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {ing.cantidad} {ing.unidad}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteIngrediente(ing.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={showModal} onClose={handleCloseModal} title="Agregar Ingrediente">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Alimento</label>
            <Input
              value={searchAlimento}
              onChange={(e) => setSearchAlimento(e.target.value)}
              placeholder="Escriba para buscar..."
            />
            {alimentos.length > 0 && (
              <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                {alimentos.map((alimento) => (
                  <div
                    key={alimento.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectAlimento(alimento)}
                  >
                    <div className="font-medium">{alimento.nombre}</div>
                    <div className="text-xs text-gray-500">{alimento.categoria_nombre}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedAlimento && (
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium">Seleccionado: {selectedAlimento.nombre}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad (gramos)</label>
            <Input
              type="number"
              step="0.001"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="100"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleAddIngrediente} className="flex-1">
              Agregar
            </Button>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
