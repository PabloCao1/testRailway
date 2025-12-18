import { Model } from '@nozbe/watermelondb'
import { field, readonly, date, children } from '@nozbe/watermelondb/decorators'

export default class Institucion extends Model {
  static table = 'instituciones'
  static associations = {
    visitas: { type: 'has_many' as const, foreignKey: 'institucion_id' },
  }

  @field('codigo') codigo!: string
  @field('nombre') nombre!: string
  @field('tipo') tipo!: string
  @field('direccion') direccion!: string
  @field('barrio') barrio!: string
  @field('comuna') comuna!: string
  @field('activo') activo!: boolean
  @field('synced') synced!: boolean
  @field('server_id') serverId!: number | null
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
  
  @children('visitas') visitas: any
}
