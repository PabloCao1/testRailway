import apiClient from './apiClient'
import { createReportesService } from '../../../shared/services/reportesService'

export interface DashboardStats {
  total_instituciones: number
  total_visitas: number
  total_platos: number
  visitas_por_tipo: { tipo_comida: string; count: number }[]
}

const sharedReportesService = createReportesService(apiClient)

export const reportesService = {
  async getDashboardStats() {
    const response = await apiClient.get('/auditoria/reportes/dashboard/')
    return response.data
  },

  async getRankingInstituciones() {
    const response = await apiClient.get('/auditoria/reportes/ranking/', {
      params: { limit: 10 },
    })
    return response.data
  },
}
