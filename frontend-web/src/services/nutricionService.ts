import apiClient from './apiClient'

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

export const nutricionService = {
  async getCategorias(params?: { search?: string }) {
    const response = await apiClient.get<{ results: CategoriaAlimento[] }>('/nutricion/categorias/', { params })
    return response.data
  },

  async getCategoria(id: number) {
    const response = await apiClient.get<CategoriaAlimento>(`/nutricion/categorias/${id}/`)
    return response.data
  },

  async createCategoria(data: Partial<CategoriaAlimento>) {
    const response = await apiClient.post<CategoriaAlimento>('/nutricion/categorias/', data)
    return response.data
  },

  async updateCategoria(id: number, data: Partial<CategoriaAlimento>) {
    const response = await apiClient.put<CategoriaAlimento>(`/nutricion/categorias/${id}/`, data)
    return response.data
  },

  async deleteCategoria(id: number) {
    await apiClient.delete(`/nutricion/categorias/${id}/`)
  },

  async getAlimentos(params?: { search?: string; categoria?: number }) {
    const response = await apiClient.get<{ results: AlimentoNutricional[] }>('/nutricion/alimentos/', { params })
    return response.data
  },

  async getAlimento(id: number) {
    const response = await apiClient.get<AlimentoNutricional>(`/nutricion/alimentos/${id}/`)
    return response.data
  },

  async createAlimento(data: Partial<AlimentoNutricional>) {
    const response = await apiClient.post<AlimentoNutricional>('/nutricion/alimentos/', data)
    return response.data
  },

  async updateAlimento(id: number, data: Partial<AlimentoNutricional>) {
    const response = await apiClient.put<AlimentoNutricional>(`/nutricion/alimentos/${id}/`, data)
    return response.data
  },

  async deleteAlimento(id: number) {
    await apiClient.delete(`/nutricion/alimentos/${id}/`)
  },
}
