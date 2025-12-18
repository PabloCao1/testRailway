export const createReportesService = (apiClient: any) => ({
  async getDashboard() {
    const response = await apiClient.get('/auditoria/reportes/dashboard/')
    return response.data
  },

  async getRanking(params?: { limit?: number }) {
    const response = await apiClient.get('/auditoria/reportes/ranking/', { params })
    return response.data
  },

  async getReporteInstitucion(id: number) {
    const response = await apiClient.get(`/auditoria/reportes/institucion/${id}/`)
    return response.data
  },

  async getVisitasPeriodo(params: { fecha_inicio: string; fecha_fin: string }) {
    const response = await apiClient.get('/auditoria/reportes/visitas-periodo/', { params })
    return response.data
  },

  async getComparativa(institucionIds: number[]) {
    const response = await apiClient.post('/auditoria/reportes/comparativa/', { instituciones: institucionIds })
    return response.data
  },
})
