'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

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
        <Header 
          user={user} 
          onMenuClick={handleMobileOpen}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
