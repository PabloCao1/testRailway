import apiClient from './apiClient'

export interface DashboardStats {
  total_instituciones: number
  total_visitas: number
  total_platos: number
  visitas_por_tipo: { tipo_comida: string; count: number }[]
  instituciones_por_tipo: { tipo: string; count: number }[]
}

export interface VisitaPeriodo {
  dia: string
  count: number
}

export interface ReporteInstitucion {
  institucion: {
    id: number
    nombre: string
    codigo: string
    tipo: string
  }
  total_visitas: number
  visitas_por_tipo_comida: { tipo_comida: string; count: number }[]
  total_platos: number
  promedios_nutricionales: {
    energia_promedio: number
    proteinas_promedio: number
    grasas_promedio: number
    carbohidratos_promedio: number
    fibra_promedio: number
    sodio_promedio: number
  }
  ultimas_visitas: any[]
}

export interface RankingInstitucion {
  institucion__id: number
  institucion__nombre: string
  institucion__tipo: string
  total_visitas: number
}

export const reportesService = {
  async getDashboardStats() {
    const response = await apiClient.get<DashboardStats>('/auditoria/reportes/dashboard/')
    return response.data
  },

  async getVisitasPorPeriodo(params?: { fecha_inicio?: string; fecha_fin?: string }) {
    const response = await apiClient.get<VisitaPeriodo[]>('/auditoria/reportes/visitas-periodo/', { params })
    return response.data
  },

  async getReporteInstitucion(institucionId: number, params?: { fecha_inicio?: string; fecha_fin?: string }) {
    const response = await apiClient.get<ReporteInstitucion>(
      `/auditoria/reportes/institucion/${institucionId}/`,
      { params }
    )
    return response.data
  },

  async getRankingInstituciones(params?: { fecha_inicio?: string; fecha_fin?: string; limit?: number }) {
    const response = await apiClient.get<RankingInstitucion[]>('/auditoria/reportes/ranking/', { params })
    return response.data
  },

  async getComparativaNutricional(data: {
    institucion_ids: number[]
    fecha_inicio?: string
    fecha_fin?: string
  }) {
    const response = await apiClient.post('/auditoria/reportes/comparativa/', data)
    return response.data
  },

  async getReporteConFiltros(params: any) {
    const response = await apiClient.get('/auditoria/reportes/instituciones-filtros/', { params })
    return response.data
  },
}
