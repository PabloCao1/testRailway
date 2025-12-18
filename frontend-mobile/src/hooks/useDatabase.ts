import { database } from '../database'
import { Q } from '@nozbe/watermelondb'

export const useDatabase = () => {
  // Alimentos
  const searchAlimentos = async (query: string) => {
    return await database.get('alimentos')
      .query(Q.where('nombre', Q.like(`%${Q.sanitizeLikeString(query)}%`)))
      .fetch()
  }

  const getAlimentoById = async (id: string) => {
    return await database.get('alimentos').find(id)
  }

  // Instituciones
  const getInstituciones = async () => {
    return await database.get('instituciones')
      .query(Q.where('activo', true), Q.sortBy('nombre', Q.asc))
      .fetch()
  }

  const createInstitucion = async (data: any) => {
    return await database.write(async () => {
      return await database.get('instituciones').create((record: any) => {
        record.codigo = data.codigo
        record.nombre = data.nombre
        record.tipo = data.tipo
        record.direccion = data.direccion || ''
        record.barrio = data.barrio || ''
        record.comuna = data.comuna || ''
        record.activo = true
        record.synced = false
        record.serverId = null
      })
    })
  }

  // Visitas
  const getVisitas = async () => {
    return await database.get('visitas')
      .query(Q.sortBy('fecha', Q.desc))
      .fetch()
  }

  const createVisita = async (data: any) => {
    return await database.write(async () => {
      return await database.get('visitas').create((record: any) => {
        record.institucionId = data.institucionId
        record.fecha = data.fecha
        record.tipoComida = data.tipoComida
        record.observaciones = data.observaciones || ''
        record.formularioCompletado = false
        record.formularioRespuestas = {}
        record.synced = false
        record.serverId = null
      })
    })
  }

  const updateVisita = async (visitaId: string, data: any) => {
    const visita = await database.get('visitas').find(visitaId)
    return await database.write(async () => {
      return await visita.update((record: any) => {
        if (data.observaciones !== undefined) record.observaciones = data.observaciones
        if (data.formularioCompletado !== undefined) record.formularioCompletado = data.formularioCompletado
        if (data.formularioRespuestas !== undefined) record.formularioRespuestas = data.formularioRespuestas
        record.synced = false
      })
    })
  }

  // Platos
  const createPlato = async (data: any) => {
    return await database.write(async () => {
      return await database.get('platos').create((record: any) => {
        record.visitaId = data.visitaId
        record.nombre = data.nombre
        record.tipoPlato = data.tipoPlato || 'principal'
        record.porcionesServidas = data.porcionesServidas || 1
        record.energiaKcalTotal = 0
        record.proteinasGTotal = 0
        record.grasasTotalesGTotal = 0
        record.carbohidratosGTotal = 0
        record.synced = false
        record.serverId = null
      })
    })
  }

  // Ingredientes
  const createIngrediente = async (data: any) => {
    const alimento = await database.get('alimentos').find(data.alimentoId)
    const factor = data.cantidad / 100

    return await database.write(async () => {
      const ingrediente = await database.get('ingredientes').create((record: any) => {
        record.platoId = data.platoId
        record.alimentoId = data.alimentoId
        record.cantidad = data.cantidad
        record.unidad = data.unidad || 'g'
        record.energiaKcal = alimento.energiaKcal * factor
        record.proteinasG = alimento.proteinasG * factor
        record.grasasTotalesG = alimento.grasasTotalesG * factor
        record.carbohidratosG = alimento.carbohidratosG * factor
        record.synced = false
      })

      // Recalcular totales del plato
      await recalcularTotalesPlato(data.platoId)

      return ingrediente
    })
  }

  const recalcularTotalesPlato = async (platoId: string) => {
    const plato = await database.get('platos').find(platoId)
    const ingredientes = await plato.ingredientes.fetch()

    let totalEnergia = 0
    let totalProteinas = 0
    let totalGrasas = 0
    let totalCarbohidratos = 0

    ingredientes.forEach((ing: any) => {
      totalEnergia += ing.energiaKcal
      totalProteinas += ing.proteinasG
      totalGrasas += ing.grasasTotalesG
      totalCarbohidratos += ing.carbohidratosG
    })

    await database.write(async () => {
      await plato.update((record: any) => {
        record.energiaKcalTotal = totalEnergia
        record.proteinasGTotal = totalProteinas
        record.grasasTotalesGTotal = totalGrasas
        record.carbohidratosGTotal = totalCarbohidratos
        record.synced = false
      })
    })
  }

  return {
    searchAlimentos,
    getAlimentoById,
    getInstituciones,
    createInstitucion,
    getVisitas,
    createVisita,
    updateVisita,
    createPlato,
    createIngrediente,
    recalcularTotalesPlato
  }
}
