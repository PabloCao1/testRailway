// Abstracción de storage compatible con Web y React Native
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

// Para Web (localStorage)
export class WebStorage implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value)
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key)
  }
}

// Para React Native (SecureStore)
export class MobileStorage implements StorageAdapter {
  private SecureStore: any

  constructor(secureStore: any) {
    this.SecureStore = secureStore
  }

  async getItem(key: string): Promise<string | null> {
    return await this.SecureStore.getItemAsync(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.SecureStore.setItemAsync(key, value)
  }

  async removeItem(key: string): Promise<void> {
    await this.SecureStore.deleteItemAsync(key)
  }
}

// Singleton para storage
let storageInstance: StorageAdapter

export const initStorage = (adapter: StorageAdapter) => {
  storageInstance = adapter
}

export const getStorage = (): StorageAdapter => {
  if (!storageInstance) {
    throw new Error('Storage not initialized. Call initStorage first.')
  }
  return storageInstance
}
