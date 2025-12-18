import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [rememberMe, setRememberMe] = useState(false)
  const { login, isLoading, error, isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with credentials:', credentials)
    login(credentials)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Image with Overlay */}
      <div className="w-1/2 h-screen hidden lg:block relative overflow-hidden">
        <img 
          src="https://img.freepik.com/fotos-premium/imagen-fondo_910766-187.jpg?w=826" 
          alt="Auditoría Nutricional" 
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80 flex items-center justify-center">
          <div className="text-center text-white px-12">
            <div className="text-6xl mb-6">🍎</div>
            <h1 className="text-5xl font-bold mb-4">Auditoría Nutricional</h1>
            <p className="text-xl opacity-90">Sistema de gestión y control de calidad alimentaria</p>
          </div>
        </div>
      </div>
      
      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          {/* Logo/Icon */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-block p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg mb-3 sm:mb-4">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Bienvenido</h2>
            <p className="text-sm sm:text-base text-gray-600">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    id="username" 
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors" 
                    placeholder="Ingresa tu usuario"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input 
                    type="password" 
                    id="password" 
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors" 
                    placeholder="Ingresa tu contraseña"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
              
              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                    Recordarme
                  </label>
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-sm text-red-700">Error al iniciar sesión. Verifica tus credenciales.</p>
                </div>
              )}
              
              {/* Login Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2.5 sm:py-3 px-4 text-sm sm:text-base rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : 'Iniciar Sesión'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs sm:text-sm text-gray-600 mt-6 sm:mt-8">
            Sistema de Auditoría Nutricional 
          </p>
        </div>
      </div>
    </div>
  )
}