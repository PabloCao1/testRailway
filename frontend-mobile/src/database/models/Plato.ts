import { Model } from '@nozbe/watermelondb'
import { field, readonly, date, relation, children } from '@nozbe/watermelondb/decorators'

export default class Plato extends Model {
  static table = 'platos'
  static associations = {
    visita: { type: 'belongs_to' as const, key: 'visita_id' },
    ingredientes: { type: 'has_many' as const, foreignKey: 'plato_id' },
  }

  @field('visita_id') visitaId!: string
  @field('nombre') nombre!: string
  @field('tipo_plato') tipoPlato!: string
  @field('porciones_servidas') porcionesServidas!: number
  @field('energia_kcal_total') energiaKcalTotal!: number
  @field('proteinas_g_total') proteinasGTotal!: number
  @field('grasas_totales_g_total') grasasTotalesGTotal!: number
  @field('carbohidratos_g_total') carbohidratosGTotal!: number
  @field('synced') synced!: boolean
  @field('server_id') serverId!: number | null
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
  
  @relation('visitas', 'visita_id') visita: any
  @children('ingredientes') ingredientes: any
}
