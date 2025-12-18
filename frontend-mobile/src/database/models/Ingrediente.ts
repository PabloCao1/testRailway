import { Model } from '@nozbe/watermelondb'
import { field, readonly, date, relation } from '@nozbe/watermelondb/decorators'

export default class Ingrediente extends Model {
  static table = 'ingredientes'
  static associations = {
    plato: { type: 'belongs_to' as const, key: 'plato_id' },
    alimento: { type: 'belongs_to' as const, key: 'alimento_id' },
  }

  @field('plato_id') platoId!: string
  @field('alimento_id') alimentoId!: string
  @field('cantidad') cantidad!: number
  @field('unidad') unidad!: string
  @field('energia_kcal') energiaKcal!: number
  @field('proteinas_g') proteinasG!: number
  @field('grasas_totales_g') grasasTotalesG!: number
  @field('carbohidratos_g') carbohidratosG!: number
  @field('synced') synced!: boolean
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
  
  @relation('platos', 'plato_id') plato: any
  @relation('alimentos', 'alimento_id') alimento: any
}
