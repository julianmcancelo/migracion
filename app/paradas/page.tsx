'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import MapaLeafletMejorado from '@/components/paradas/MapaLeafletMejorado'
import FormularioParada from '@/components/paradas/FormularioParada'
import { Parada, ParadaFormData, TIPOS_PARADA } from '@/components/paradas/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function ParadasPage() {
  const [paradas, setParadas] = useState<Parada[]>([])
  const [loading, setLoading] = useState(true)
  const [editingParada, setEditingParada] = useState<Parada | null>(null)
  const [deletingParada, setDeletingParada] = useState<Parada | null>(null)
  const [clickedLat, setClickedLat] = useState<number>()
  const [clickedLng, setClickedLng] = useState<number>()
  // Coordenadas actuales de la parada en edición (actualizadas al arrastrar)
  const [editingLat, setEditingLat] = useState<number>()
  const [editingLng, setEditingLng] = useState<number>()

  // Cargar paradas al montar el componente
  useEffect(() => {
    cargarParadas()
  }, [])

  const cargarParadas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/paradas')
      const data = await response.json()

      if (data.success) {
        setParadas(data.data)
      } else {
        toast.error('Error al cargar paradas')
      }
    } catch (error) {
      console.error('Error al cargar paradas:', error)
      toast.error('Error al cargar paradas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: ParadaFormData) => {
    try {
      let response

      if (editingParada) {
        // Actualizar parada existente
        response = await fetch(`/api/paradas/${editingParada.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        // Crear nueva parada
        response = await fetch('/api/paradas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }

      const data = await response.json()

      if (data.success) {
        toast.success(
          editingParada
            ? 'Parada actualizada exitosamente'
            : 'Parada creada exitosamente'
        )
        setEditingParada(null)
        cargarParadas()
      } else {
        toast.error(data.error || 'Error al guardar parada')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar parada')
    }
  }

  const handleDelete = async () => {
    if (!deletingParada) return

    try {
      const response = await fetch(`/api/paradas/${deletingParada.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Parada eliminada exitosamente')
        setDeletingParada(null)
        cargarParadas()
      } else {
        toast.error(data.error || 'Error al eliminar parada')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar parada')
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    if (!editingParada) {
      setClickedLat(lat)
      setClickedLng(lng)
    }
  }

  const handleEditClick = (parada: Parada) => {
    setEditingParada(parada)
    // Establecer coordenadas iniciales de edición
    setEditingLat(parada.latitud)
    setEditingLng(parada.longitud)
    // Scroll al formulario en móvil
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleCancelEdit = () => {
    setEditingParada(null)
    setEditingLat(undefined)
    setEditingLng(undefined)
  }

  const handleMarkerDragEnd = (paradaId: number, lat: number, lng: number) => {
    // Actualizar coordenadas de edición cuando se arrastra el marcador
    setEditingLat(lat)
    setEditingLng(lng)
    toast.info('📍 Ubicación actualizada. Guarda los cambios para confirmar.')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-50">
      {/* Panel Lateral - Formulario */}
      <aside className="w-full md:w-96 h-auto md:h-full overflow-y-auto bg-white border-r shadow-sm p-4">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-map-location-dot text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Mapa de Lanús
              </h1>
              <p className="text-sm text-gray-500">Sistema de Puntos de Interés</p>
            </div>
          </div>
          
          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{paradas.length}</p>
                </div>
                <i className="fa-solid fa-map-pin text-blue-400 text-2xl"></i>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium uppercase">Activos</p>
                  <p className="text-2xl font-bold text-green-900">{paradas.filter(p => p.activo).length}</p>
                </div>
                <i className="fa-solid fa-circle-check text-green-400 text-2xl"></i>
              </div>
            </div>
          </div>

          {/* Tipos de paradas */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">Por Tipo</p>
            <div className="space-y-1.5">
              {Object.entries(
                paradas.reduce((acc, p) => {
                  acc[p.tipo] = (acc[p.tipo] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([tipo, count]) => (
                <div key={tipo} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 capitalize flex items-center gap-2">
                    <i className={`fa-solid fa-circle text-[8px]`} style={{ color: TIPOS_PARADA[tipo as keyof typeof TIPOS_PARADA]?.color || '#64748b' }}></i>
                    {TIPOS_PARADA[tipo as keyof typeof TIPOS_PARADA]?.label || tipo}
                  </span>
                  <span className="font-semibold text-gray-800">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <FormularioParada
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
          editingParada={editingParada}
          initialLat={clickedLat}
          initialLng={clickedLng}
          editingLat={editingLat}
          editingLng={editingLng}
        />
      </aside>

      {/* Mapa Principal */}
      <main className="flex-1 h-[400px] md:h-full relative">
        <MapaLeafletMejorado
          paradas={paradas}
          onMapClick={handleMapClick}
          onEditClick={handleEditClick}
          onDeleteClick={setDeletingParada}
          onMarkerDragEnd={handleMarkerDragEnd}
          editingParadaId={editingParada?.id || null}
        />
      </main>

      {/* Modal de Confirmación de Eliminación */}
      <AlertDialog
        open={!!deletingParada}
        onOpenChange={() => setDeletingParada(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Punto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar el punto &quot;
              {deletingParada?.titulo}&quot;? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
