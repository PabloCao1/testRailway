import { MobileStorage, initStorage } from '../../../shared/utils/storage'
import * as SecureStore from 'expo-secure-store'

// Inicializar storage para mobile
initStorage(new MobileStorage(SecureStore))

export { getStorage } from '../../../shared/utils/storage'
