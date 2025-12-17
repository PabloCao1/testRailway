# Plan de Implementación: Sistema de Auditoría Alimenticia Offline-First

## 1. Arquitectura General

El sistema sigue una arquitectura **Cliente-Servidor Desconectado**.

*   **Backend (Núcleo):** Django + DRF exponiendo una API REST. Actúa como la "Fuente de la Verdad" (Source of Truth).
*   **Base de Datos Central:** MySQL. Almacena todos los datos históricos y consolidados.
*   **Cliente Móvil (Offline):** React Native (Expo). Mantiene una copia local de los datos relevantes en SQLite.
    *   *Ciclo:* `Lectura Local` -> `Escritura Local` -> `Cola de Sincronización` -> `Envío al Backend`.
*   **Cliente Web (Admin):** React (Vite). Consume la API directamente.

### Diagrama de Flujo de Datos (Sync)

```mermaid
graph TD
    A[Móvil: Acción Usuario] -->|Guardar| B(SQLite Local)
    B -->|Marca 'synced=0'| B
    C[Detector de Red] -->|Online detectado| D{Sincronizador}
    D -->|1. POST /api/sync (JSON)| E[Backend Django]
    E -->|2. Valida y Guarda| F(MySQL)
    E -->|3. Responde IDs confirmados| D
    D -->|4. Marca 'synced=1'| B
    D -->|5. Sube Fotos (Background)| G[Backend Media]
```

## 2. Diseño de Base de Datos (MySQL)

Esquema relacional simplificado para MySQL.

### Tablas Principales

1.  **users** (Extiende AbstractUser)
    *   `id`, `username`, `role` (admin/auditor), `email`
2.  **establishments** (Lugares a auditar)
    *   `id` (UUID), `name`, `address`, `created_at`
3.  **audits** (La cabecera de la auditoría)
    *   `id` (UUID) - *Clave primaria generada en móvil*
    *   `auditor_id` (FK User)
    *   `establishment_id` (FK Establishment)
    *   `date` (Datetime)
    *   `status` (Enum: DRAFT, COMPLETED, VALIDATED)
    *   `score` (Integer)
    *   `observations` (Text)
    *   `created_at`, `updated_at` (Datetime) - *Crítico para sync*
    *   `deleted_at` (Datetime, Nullable) - *Soft delete para sync*
4.  **audit_items** (Respuestas del checklist)
    *   `id` (UUID)
    *   `audit_id` (FK Audit)
    *   `question_key` (String, ej: 'temp_nevera')
    *   `is_compliant` (Boolean)
    *   `value` (String/Text)
5.  **audit_photos**
    *   `id` (UUID)
    *   `audit_id` (FK Audit)
    *   `local_uri` (String - solo móvil)
    *   `remote_url` (String - URL S3/Media)
    *   `synced` (Boolean - solo móvil)

## 12. Estrategia de Sincronización (Paso a Paso)

La estrategia elegida es **Delta Sync con "Last Write Wins" (basado en servidor)**.

1.  **Identificación Única:** Todos los registros (Auditorías, Items) usan **UUIDv4** generados en el dispositivo. Esto evita colisiones de ID al crear registros offline.
2.  **Rastreo de Cambios (Cliente):**
    *   Cada tabla en SQLite tiene una columna `synced` (0 o 1) y `updated_at`.
    *   Al crear/editar: `synced = 0`, `updated_at = now()`.
3.  **Proceso de Envío (Push):**
    *   El móvil busca registros con `synced = 0`.
    *   Envía un payload JSON al endpoint `/api/sync/push`.
4.  **Resolución de Conflictos (Servidor):**
    *   El servidor recibe el lote. Para cada registro:
        *   Si no existe: Lo crea.
        *   Si existe: Compara `client.updated_at` vs `server.updated_at`.
        *   Si `client.updated_at > server.updated_at`: Actualiza.
        *   Si no: Ignora (o guarda conflicto). *Regla simple: El servidor protege datos más recientes.*
5.  **Confirmación:**
    *   El servidor responde con una lista de UUIDs que fueron procesados exitosamente.
    *   El móvil marca esos UUIDs como `synced = 1`.
6.  **Bajada de Datos (Pull):**
    *   El móvil pide `/api/sync/pull?last_sync_timestamp=...`
    *   El servidor envía todo lo modificado después de esa fecha.

## 13. Buenas Prácticas Aplicadas

*   **Seguridad:** JWT para auth. Los tokens se guardan en `SecureStore` (iOS/Android).
*   **Performance:** Endpoints de sync en lotes (Bulk create/update) para no saturar la red con miles de requests.
*   **Atomicidad:** El proceso de sync en el backend se envuelve en `transaction.atomic()` para asegurar integridad.
