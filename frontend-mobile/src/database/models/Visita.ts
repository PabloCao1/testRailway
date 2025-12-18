import { Model } from '@nozbe/watermelondb'
import { field, readonly, date, relation, children, json } from '@nozbe/watermelondb/decorators'

const sanitizeJSON = (json: any) => json || {}

export default class Visita extends Model {
  static table = 'visitas'
  static associations = {
    institucion: { type: 'belongs_to' as const, key: 'institucion_id' },
    platos: { type: 'has_many' as const, foreignKey: 'visita_id' },
  }

  @field('institucion_id') institucionId!: string
  @field('fecha') fecha!: number
  @field('tipo_comida') tipoComida!: string
  @field('observaciones') observaciones!: string
  @field('formulario_completado') formularioCompletado!: boolean
  @json('formulario_respuestas', sanitizeJSON) formularioRespuestas!: any
  @field('synced') synced!: boolean
  @field('server_id') serverId!: number | null
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
  
  @relation('instituciones', 'institucion_id') institucion: any
  @children('platos') platos: any
}
