import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export default class Alimento extends Model {
  static table = 'alimentos'

  @field('codigo_argenfood') codigoArgenfood!: number
  @field('nombre') nombre!: string
  @field('categoria_id') categoriaId!: number
  @field('energia_kcal') energiaKcal!: number
  @field('proteinas_g') proteinasG!: number
  @field('grasas_totales_g') grasasTotalesG!: number
  @field('carbohidratos_g') carbohidratosG!: number
  @field('fibra_g') fibraG!: number
  @field('sodio_mg') sodioMg!: number
  @field('calcio_mg') calcioMg!: number
  @field('hierro_mg') hierroMg!: number
  @field('zinc_mg') zincMg!: number
  @field('vitamina_c_mg') vitaminaCMg!: number
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
