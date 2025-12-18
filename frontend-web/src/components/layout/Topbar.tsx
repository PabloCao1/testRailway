import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Bars3Icon } from '@heroicons/react/24/outline'

interface TopbarProps {
  onMobileMenuToggle?: () => void
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Botón menú móvil */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Panel</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xs sm:text-sm font-bold">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-900">
                {user?.first_name || user?.username || 'Usuario'}
              </div>
              <div className="text-xs text-gray-500">Administrador</div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={logout} 
            className="hover:bg-red-50 hover:text-red-600 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
          >
            <span className="hidden sm:inline">Cerrar sesión</span>
            <span className="sm:hidden">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  )
}