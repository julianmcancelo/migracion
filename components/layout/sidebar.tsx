'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ClipboardList,
  CheckCircle,
  Calendar,
  ChevronLeft,
  X,
  FileCheck,
  Shield,
  Car,
  Users,
  MapPin,
  Settings,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

/**
 * Sidebar de navegación del panel
 * - Modo colapsable en desktop (expandido/mini)
 * - Modo overlay en móvil
 * - Responsive y optimizado para espacio
 */
export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Habilitaciones',
      href: '/habilitaciones',
      icon: ClipboardList,
    },
    {
      name: 'Vehículos',
      href: '/vehiculos',
      icon: Car,
    },
    {
      name: 'Personas',
      href: '/personas',
      icon: Users,
    },
    {
      name: 'Establecimientos',
      href: '/establecimientos',
      icon: MapPin,
    },
    {
      name: 'Obleas',
      href: '/obleas',
      icon: Shield,
    },
    {
      name: 'Inspecciones',
      href: '/inspecciones',
      icon: CheckCircle,
    },
    {
      name: 'Verificaciones',
      href: '/verificaciones',
      icon: FileCheck,
    },
    {
      name: 'Turnos',
      href: '/turnos',
      icon: Calendar,
      badge: 3,
    },
    {
      name: 'Configuración',
      href: '/configuracion',
      icon: Settings,
    },
  ]

  const handleLinkClick = () => {
    // Cerrar sidebar en móvil al hacer clic en un link
    if (mobileOpen) {
      onMobileClose()
    }
  }

  const sidebarContent = (
    <>
      {/* Header del sidebar con botón de colapsar */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600">
              <span className="text-sm font-bold text-white">ML</span>
            </div>
            <span className="text-sm font-semibold text-white">Municipio Lanús</span>
          </div>
        )}

        {/* Botón para colapsar (desktop) o cerrar (móvil) */}
        <button
          onClick={mobileOpen ? onMobileClose : onToggle}
          className={cn(
            'rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white',
            collapsed && 'mx-auto'
          )}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Colapsar sidebar'}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <ChevronLeft
              className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')}
            />
          )}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map(item => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-sky-400' : 'text-gray-500 group-hover:text-sky-400'
                )}
              />

              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Badge en modo colapsado */}
              {collapsed && item.badge && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer del sidebar - solo visible cuando está expandido */}
      {!collapsed && (
        <div className="border-t border-gray-800 p-4">
          <div className="rounded-lg border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-blue-600/10 p-3">
            <p className="mb-1 text-xs font-semibold text-gray-300">Sistema de Gestión</p>
            <p className="text-[10px] text-gray-500">Versión 0.3.0</p>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Overlay para móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900 transition-all duration-300 ease-in-out',
          // Móvil: overlay deslizable
          'lg:relative lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: colapsable
          collapsed ? 'lg:w-16' : 'lg:w-64',
          // Ancho fijo en móvil
          'w-64'
        )}
      >
        {sidebarContent}
      </div>
    </>
  )
}
