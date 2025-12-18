import apiClient from './apiClient'
import { createNutricionService } from '../../../shared/services/nutricionService'

export * from '../../../shared/types'
export const nutricionService = createNutricionService(apiClient)
