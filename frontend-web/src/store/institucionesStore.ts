import { create } from 'zustand'
import { auditoriaService, Institucion } from '../services/auditoriaService'

interface InstitucionesStore {
  instituciones: Institucion[]
  loaded: boolean
  loading: boolean
  load: () => Promise<void>
  clear: () => void
}

export const useInstitucionesStore = create<InstitucionesStore>((set, get) => ({
  instituciones: [],
  loaded: false,
  loading: false,

  load: async () => {
    const { loaded, loading } = get()
    
    if (loaded || loading) return
    
    set({ loading: true })
    
    try {
      const data = await auditoriaService.getInstituciones({ limit: 1000 })
      set({ 
        instituciones: data.results, 
        loaded: true, 
        loading: false 
      })
    } catch (error) {
      console.error('Error loading instituciones for cache:', error)
      set({ loading: false })
    }
  },

  clear: () => {
    set({ instituciones: [], loaded: false, loading: false })
  }
}))