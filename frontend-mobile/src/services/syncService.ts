import * as SecureStore from 'expo-secure-store'
import NetInfo from '@react-native-community/netinfo'
import apiClient from './apiClient'
import { getDB } from '../database/db'

let isSyncing = false
let unsubscribeNetInfo: (() => void) | null = null

export const syncService = {
    /**
     * Arquitectura Offline-First: Sincronización Masiva
     * 1. Detectar Conectividad
     * 2. PUSH: Enviar solo registros con pending_sync = 1 al endpoint 'bulk/sync'
     * 3. PULL: Traer últimos cambios de Railway para cache local
     */
    async sync(): Promise<void> {
        if (isSyncing) return

        try {
            isSyncing = true
            const netState = await NetInfo.fetch()

            if (!netState.isConnected || !netState.isInternetReachable) {
                console.log('📡 [Sync] Offline: Operando en modo local.')
                return
            }

            const token = await SecureStore.getItemAsync('access_token')
            if (!token) return

            console.log('🔄 [Sync] Iniciando ciclo de sincronización...')

            // 1️⃣ PUSH: Mandar datos pendientes en bloque
            await this.pushUnsyncedData()

            // 2️⃣ PULL: Actualizar cache local con datos de Railway
            await this.pullRemoteUpdates()

            console.log('✅ [Sync] Ciclo completado con éxito.')
        } catch (error) {
            console.error('❌ [Sync] Error crítico:', error)
        } finally {
            isSyncing = false
        }
    },

    /**
     * Envía los registros pendientes al endpoint de sync masivo con Last-Write-Wins
     */
    async pushUnsyncedData(): Promise<void> {
        const db = getDB()
        try {
            // 1. Sincronizar Instituciones Nuevas/Editadas
            const pendingInst = await db.getAllAsync<any>('SELECT * FROM instituciones WHERE pending_sync = 1')
            if (pendingInst.length > 0) {
                console.log(`📤 [Push] Sincronizando ${pendingInst.length} instituciones...`)
                const instPayload = pendingInst.map(i => ({
                    local_id: i.id,
                    id: i.server_id,
                    nombre: i.nombre,
                    tipo: i.tipo,
                    direccion: i.direccion,
                    barrio: i.barrio,
                    comuna: i.comuna,
                    updated_at: i.updated_at
                }))
                const instRes = await apiClient.post('auditoria/instituciones/sync/', instPayload)
                if (instRes.status === 200) {
                    for (const res of instRes.data) {
                        if (res.status !== 'error') {
                            await db.runAsync(
                                'UPDATE instituciones SET pending_sync = 0, server_id = ? WHERE id = ?',
                                [res.id, res.local_id]
                            )
                        }
                    }
                }
            }

            // 2. Sincronizar Visitas/Formularios
            const pendingVisitas = await db.getAllAsync<any>('SELECT * FROM visitas WHERE pending_sync = 1')
            if (pendingVisitas.length === 0) return

            console.log(`📤 [Push] Sincronizando ${pendingVisitas.length} visitas...`)
            const payload = pendingVisitas.map(v => ({
                local_id: v.id,
                id: v.server_id,
                institucion: v.institucion_id,
                fecha: v.fecha,
                tipo_comida: v.tipo_comida,
                observaciones: v.observaciones,
                formulario_respuestas: JSON.parse(v.formulario_respuestas || '{}'),
                formulario_completado: v.formulario_completado === 1,
                updated_at: v.updated_at
            }))

            const response = await apiClient.post('auditoria/visitas/sync/', payload)
            if (response.status === 200) {
                for (const result of response.data) {
                    if (result.status !== 'error') {
                        await db.runAsync(
                            'UPDATE visitas SET pending_sync = 0, server_id = ?, synced_at = ? WHERE id = ?',
                            [result.id, new Date().toISOString(), result.local_id]
                        )
                    }
                }
            }
        } catch (error) {
            console.error('❌ [Push] Error enviando datos:', error)
        }
    },

    /**
     * Trae los últimos datos para asegurar que el cache local esté al día
     */
    async pullRemoteUpdates(): Promise<void> {
        const db = getDB()
        try {
            // Pull Instituciones (Actualizar Catalogo)
            const instRes = await apiClient.get('auditoria/instituciones/')
            const remoteInsts = instRes.data.results || instRes.data

            for (const i of remoteInsts) {
                await db.runAsync(
                    `INSERT OR REPLACE INTO instituciones 
           (server_id, nombre, tipo, direccion, barrio, comuna, updated_at, pending_sync)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
                    [i.id, i.nombre, i.tipo, i.direccion, i.barrio, i.comuna, i.updated_at]
                )
            }

            // Pull Visitas (Actualizar Historial)
            const visRes = await apiClient.get('auditoria/visitas/')
            const remoteVisits = visRes.data.results || visRes.data

            for (const v of remoteVisits) {
                // Solo sobreescribir si el servidor es más nuevo o si no está pendiente de sincronizar
                const local = await db.getFirstAsync<any>('SELECT * FROM visitas WHERE server_id = ?', [v.id])

                if (!local || (local.pending_sync === 0 && v.updated_at > local.updated_at)) {
                    await db.runAsync(
                        `INSERT OR REPLACE INTO visitas 
             (id, server_id, institucion_id, fecha, tipo_comida, observaciones, formulario_respuestas, formulario_completado, pending_sync, updated_at, synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
                        [
                            local?.id || `remote-${v.id}`,
                            v.id,
                            v.institucion,
                            v.fecha,
                            v.tipo_comida,
                            v.observaciones,
                            JSON.stringify(v.formulario_respuestas),
                            v.formulario_completado ? 1 : 0,
                            v.updated_at,
                            new Date().toISOString()
                        ]
                    )
                }
            }
        } catch (error) {
            console.error('❌ [Pull] Error actualizando cache:', error)
        }
    },

    /**
     * Monitor de conectividad para auto-reintento
     */
    startAutoSync(): void {
        if (unsubscribeNetInfo) return

        // Intento inicial
        this.sync()

        unsubscribeNetInfo = NetInfo.addEventListener(state => {
            if (state.isConnected && state.isInternetReachable) {
                console.log('📶 [Network] Señal recuperada. Sincronizando pendientes...')
                this.sync()
            }
        })
    },

    stopAutoSync(): void {
        if (unsubscribeNetInfo) {
            unsubscribeNetInfo()
            unsubscribeNetInfo = null
        }
    },

    async syncIfNeeded(): Promise<void> {
        this.sync()
    }
}

export default syncService
