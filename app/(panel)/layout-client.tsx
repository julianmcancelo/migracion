'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import ChatIAGlobal from '@/components/chat-ia-global'
import { ToastProvider } from '@/components/ui/toast-notifications'

interface PanelLayoutClientProps {
  children: React.ReactNode
  user: {
    nombre: string
    email: string
    rol: string
  }
}

/**
 * Layout del panel (Client Component)
 * - Maneja estado del sidebar (colapsado/expandido)
 * - Maneja estado del sidebar móvil (abierto/cerrado)
 * - Persiste preferencia de colapso en localStorage
 */
export function PanelLayoutClient({ children, user }: PanelLayoutClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Cargar preferencia de colapso desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true')
    }
  }, [])

  // Guardar preferencia de colapso
  const handleToggleCollapsed = () => {
    const newValue = !sidebarCollapsed
    setSidebarCollapsed(newValue)
    localStorage.setItem('sidebar-collapsed', String(newValue))
  }

  const handleMobileOpen = () => {
    setMobileOpen(true)
  }

  const handleMobileClose = () => {
    setMobileOpen(false)
  }

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={handleToggleCollapsed}
          mobileOpen={mobileOpen}
          onMobileClose={handleMobileClose}
        />

        {/* Contenido principal */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header user={user} onMenuClick={handleMobileOpen} />

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative">
            {/* Dot grid background pattern */}
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }}
            ></div>
            <div className="container mx-auto max-w-[1600px] px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8 relative">
              {children}
            </div>
          </main>
        </div>

        {/* Chat IA Global - Disponible en toda la aplicación */}
        <ChatIAGlobal />
      </div>
    </ToastProvider>
  )
}
