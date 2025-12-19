import * as SQLite from 'expo-sqlite'

let db: SQLite.SQLiteDatabase | null = null

export const initDB = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    db = await SQLite.openDatabaseAsync('auditoria_nutricional.db')

    // Enable WAL mode for better performance
    await db.execAsync('PRAGMA journal_mode = WAL;')

    // Create tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS alimentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER UNIQUE,
        nombre TEXT NOT NULL,
        grupo TEXT,
        unidad TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS instituciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER UNIQUE,
        nombre TEXT NOT NULL,
        tipo TEXT,
        direccion TEXT,
        barrio TEXT,
        comuna TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS visitas (
        id TEXT PRIMARY KEY, -- Local UUID
        server_id INTEGER UNIQUE,
        institucion_id INTEGER,
        fecha TEXT,
        tipo_comida TEXT,
        observaciones TEXT,
        formulario_respuestas TEXT,
        formulario_completado INTEGER DEFAULT 0,
        pending_sync INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        synced_at TEXT
      );

      CREATE TABLE IF NOT EXISTS platos (
        id TEXT PRIMARY KEY,
        server_id INTEGER UNIQUE,
        visita_id TEXT,
        nombre TEXT,
        descripcion TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (visita_id) REFERENCES visitas (id)
      );

      CREATE TABLE IF NOT EXISTS ingredientes (
        id TEXT PRIMARY KEY,
        server_id INTEGER UNIQUE,
        plato_id TEXT,
        alimento_id INTEGER,
        cantidad REAL,
        unidad TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (plato_id) REFERENCES platos (id),
        FOREIGN KEY (alimento_id) REFERENCES alimentos (id)
      );
    `)

    // Manual migrations / column checks
    try {
      await db.execAsync('ALTER TABLE visitas ADD COLUMN pending_sync INTEGER DEFAULT 1;')
    } catch (e) { /* already exists */ }
    try {
      await db.execAsync('ALTER TABLE visitas ADD COLUMN synced_at TEXT;')
    } catch (e) { /* already exists */ }

    // Check instituciones
    try {
      await db.execAsync('ALTER TABLE instituciones ADD COLUMN barrio TEXT;')
    } catch (e) { /* already exists */ }
    try {
      await db.execAsync('ALTER TABLE instituciones ADD COLUMN updated_at TEXT;')
    } catch (e) { /* already exists */ }

    console.log('✅ Base de datos inicializada y migrada')
    return db
  } catch (error) {
    console.error('❌ DB Init Error:', error)
    throw error
  }
}

export const getDB = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDB first.')
  }
  return db
}

export const clearAllData = async (): Promise<boolean> => {
  try {
    const database = getDB()
    await database.execAsync(`
      DELETE FROM ingredientes;
      DELETE FROM platos;
      DELETE FROM visitas;
      DELETE FROM instituciones;
      DELETE FROM alimentos;
    `)
    console.log('✅ All local data cleared')
    return true
  } catch (error) {
    console.error('❌ Error clearing data:', error)
    return false
  }
}
