import apiClient from './apiClient'
import { createAuditoriaService } from '../../../shared/services/auditoriaService'

export * from '../../../shared/types'
export const auditoriaService = createAuditoriaService(apiClient)
