'use client'

import { useState } from 'react'
import { Car, FileCheck2, Calendar, CheckSquare } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dynamic from 'next/dynamic'

// Lazy load de los componentes de cada tab
const InspeccionesTab = dynamic(() => import('@/components/control-vehicular/inspecciones-tab'), {
  loading: () => <div className="p-8 text-center">Cargando inspecciones...</div>,
})

const VerificacionesTab = dynamic(
  () => import('@/components/control-vehicular/verificaciones-tab'),
  {
    loading: () => <div className="p-8 text-center">Cargando verificaciones...</div>,
  }
)

const TurnosTab = dynamic(() => import('@/components/control-vehicular/turnos-tab'), {
  loading: () => <div className="p-8 text-center">Cargando turnos...</div>,
})

export default function ControlVehicularPage() {
  const [activeTab, setActiveTab] = useState('inspecciones')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Car className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Control Vehicular</h1>
            <p className="text-sm text-gray-500">
              Gestión de inspecciones, verificaciones y turnos
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="inspecciones" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Inspecciones</span>
            <span className="sm:hidden">Insp.</span>
          </TabsTrigger>
          <TabsTrigger value="verificaciones" className="gap-2">
            <FileCheck2 className="h-4 w-4" />
            <span className="hidden sm:inline">Verificaciones</span>
            <span className="sm:hidden">Verif.</span>
          </TabsTrigger>
          <TabsTrigger value="turnos" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Turnos</span>
            <span className="sm:hidden">Turn.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inspecciones" className="space-y-4">
          <InspeccionesTab />
        </TabsContent>

        <TabsContent value="verificaciones" className="space-y-4">
          <VerificacionesTab />
        </TabsContent>

        <TabsContent value="turnos" className="space-y-4">
          <TurnosTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
