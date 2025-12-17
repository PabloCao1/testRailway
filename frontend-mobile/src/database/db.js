import * as SQLite from 'expo-sqlite';

let db;

export const initDB = async () => {
    try {
        db = await SQLite.openDatabaseAsync('auditoria.db');

        // Enable WAL mode for better performance
        await db.execAsync('PRAGMA journal_mode = WAL;');

        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY NOT NULL,
        username TEXT NOT NULL,
        token TEXT
      );
      
      CREATE TABLE IF NOT EXISTS audits (
        id TEXT PRIMARY KEY NOT NULL,
        establishment_id TEXT,
        date TEXT,
        status TEXT,
        score INTEGER,
        observations TEXT,
        created_at TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS audit_items (
        id TEXT PRIMARY KEY NOT NULL,
        audit_id TEXT,
        question_key TEXT,
        is_compliant INTEGER,
        value TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (audit_id) REFERENCES audits (id)
      );
    `);

        console.log("DB Init Success (New API)");
        return db;
    } catch (error) {
        console.error("DB Init Error", error);
        throw error;
    }
};

export const getDB = () => {
    if (!db) {
        throw new Error("Database not initialized. Call initDB first.");
    }
    return db;
};

export const clearAllData = async () => {
    try {
        const database = getDB();
        await database.execAsync(`
            DELETE FROM audit_items;
            DELETE FROM audits;
            DELETE FROM users;
        `);
        console.log("✅ All local data cleared");
        return true;
    } catch (error) {
        console.error("❌ Error clearing data:", error);
        return false;
    }
};
