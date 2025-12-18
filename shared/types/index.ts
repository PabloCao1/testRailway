export interface Institucion {
  id: number
  codigo: string
  nombre: string
  tipo: string
  direccion?: string
  barrio?: string
  comuna?: string
  activo: boolean
}

export interface VisitaAuditoria {
  id: number
  institucion: number
  institucion_nombre?: string
  fecha: string
  tipo_comida: string
  observaciones?: string
  platos?: PlatoObservado[]
}

export interface PlatoObservado {
  id: number
  visita: number
  nombre: string
  tipo_plato?: string
  porciones_servidas?: number
  notas?: string
  energia_kcal_total?: number
  proteinas_g_total?: number
  grasas_totales_g_total?: number
  carbohidratos_g_total?: number
  fibra_g_total?: number
  sodio_mg_total?: number
  ingredientes?: IngredientePlato[]
}

export interface IngredientePlato {
  id: number
  plato: number
  alimento: number
  alimento_nombre?: string
  cantidad: number
  unidad: string
  orden?: number
  energia_kcal?: number
  proteinas_g?: number
  grasas_totales_g?: number
  carbohidratos_g?: number
  fibra_g?: number
  sodio_mg?: number
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

export interface CategoriaAlimento {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
}

export interface AlimentoNutricional {
  id: number
  codigo_argenfood: string
  nombre: string
  categoria: number
  categoria_nombre?: string
  energia_kcal?: number
  proteinas_g?: number
  grasas_totales_g?: number
  carbohidratos_totales_g?: number
}
