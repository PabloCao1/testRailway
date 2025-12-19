import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TextInput, StatusBar, ImageBackground, Dimensions } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

export function LoginScreen() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

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
      const userData = await authService.getMe(tokens.access)
      await login(tokens, userData)
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message)
      Alert.alert('Error', 'No se pudo iniciar sesión. Revisa tu conexión u usuario.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con Imagen de fondo + Overlay Gradiente 80% */}
        <ImageBackground
          source={{ uri: 'https://img.freepik.com/fotos-premium/imagen-fondo_910766-187.jpg?w=826' }}
          style={styles.headerBackground}
          imageStyle={styles.headerImage}
        >
          <LinearGradient
            colors={['rgba(37, 99, 235, 0.8)', 'rgba(147, 51, 234, 0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientOverlay}
          >
            <View style={styles.headerContent}>
              <Text style={styles.appleEmoji}>🍎</Text>
              <Text style={styles.brandTitle}>Auditoría Nutricional</Text>
              <Text style={styles.brandSlogan}>Sistema de gestión y control de calidad alimentaria</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.formArea}>
          {/* Card de Login posicionada más abajo con sombra profunda */}
          <View style={styles.loginCard}>
            <View style={styles.titleWrapper}>
              <Text style={styles.primaryText}>Bienvenido</Text>
              <Text style={styles.secondaryText}>Ingresa tus credenciales para continuar</Text>
            </View>

            {/* Input Usuario */}
            <View style={[
              styles.inputBox,
              focusedField === 'username' && styles.inputBoxActive
            ]}>
              <Ionicons
                name="person-outline"
                size={20}
                color={focusedField === 'username' ? '#3B82F6' : '#9CA3AF'}
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Usuario"
                placeholderTextColor="#9CA3AF"
                value={credentials.username}
                onChangeText={(text) => setCredentials({ ...credentials, username: text })}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
              />
            </View>

            {/* Input Contraseña */}
            <View style={[
              styles.inputBox,
              focusedField === 'password' && styles.inputBoxActive
            ]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={focusedField === 'password' ? '#3B82F6' : '#9CA3AF'}
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Contraseña"
                placeholderTextColor="#9CA3AF"
                value={credentials.password}
                onChangeText={(text) => setCredentials({ ...credentials, password: text })}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, isLoading && styles.actionBtnLoading]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3B82F6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                <Text style={styles.btnLabel}>
                  {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.copyrightText}>Auditoría Nutricional © 2025</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6'
  },
  scrollContent: {
    flexGrow: 1
  },
  headerBackground: {
    height: 380,
    width: width,
  },
  headerImage: {
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    // El efecto de arco/onda se logra con estos radios exagerados
  },
  gradientOverlay: {
    flex: 1,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  appleEmoji: {
    fontSize: 72, // Equivalente a text-6xl aproximado
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  brandSlogan: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formArea: {
    paddingHorizontal: 24,
    marginTop: -100, // Empuja el card hacia ARRIBA interceptando el arco
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  titleWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  primaryText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827'
  },
  secondaryText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center'
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  inputBoxActive: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  fieldIcon: {
    marginRight: 12
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    height: '100%',
  },
  passwordToggle: {
    padding: 8
  },
  actionBtn: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  actionBtnLoading: {
    opacity: 0.7
  },
  btnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  footerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 13,
    color: '#9CA3AF'
  },
})
