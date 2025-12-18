import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Overlay para móvil */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:transform-none ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Topbar onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}