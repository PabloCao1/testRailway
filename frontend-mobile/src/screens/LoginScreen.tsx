import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function LoginScreen() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuthStore((state) => state.login)

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      Alert.alert('Error', 'Por favor completa todos los campos')
      return
    }

    const netState = await NetInfo.fetch()
    if (!(netState.isConnected ?? false)) {
      Alert.alert('Sin conexión', 'Necesitas estar online para iniciar sesión.')
      return
    }

    setIsLoading(true)
    try {
      const tokens = await authService.login(credentials)
      const userData = await authService.getMe()
      await login(tokens, userData)
    } catch (error) {
      Alert.alert('Error', 'Credenciales incorrectas')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Auditoria</Text>
        <Text style={styles.subtitle}>Iniciar sesión</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Usuario</Text>
          <Input
            placeholder="Ingresa tu usuario"
            value={credentials.username}
            onChangeText={(text) => setCredentials({ ...credentials, username: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <Input
            placeholder="Ingresa tu contraseña"
            value={credentials.password}
            onChangeText={(text) => setCredentials({ ...credentials, password: text })}
            secureTextEntry
          />
        </View>

        <Button
          title={isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          onPress={handleLogin}
          disabled={isLoading}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
})
