'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import MapaLeaflet from '@/components/paradas/MapaLeaflet'
import FormularioParada from '@/components/paradas/FormularioParada'
import { Parada, ParadaFormData } from '@/components/paradas/types'
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
import { Card } from '@/components/ui/card'

export default function ParadasPage() {
  const [paradas, setParadas] = useState<Parada[]>([])
  const [loading, setLoading] = useState(true)
  const [editingParada, setEditingParada] = useState<Parada | null>(null)
  const [deletingParada, setDeletingParada] = useState<Parada | null>(null)
  const [clickedLat, setClickedLat] = useState<number>()
  const [clickedLng, setClickedLng] = useState<number>()

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
    // Scroll al formulario en móvil
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleCancelEdit = () => {
    setEditingParada(null)
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
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-xl font-bold">ML</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Mapa de Lanús
              </h1>
              <p className="text-sm text-gray-500">Puntos de Interés</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Total de puntos: <strong className="text-blue-600">{paradas.length}</strong>
          </p>
        </div>

        <FormularioParada
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
          editingParada={editingParada}
          initialLat={clickedLat}
          initialLng={clickedLng}
        />
      </aside>

      {/* Mapa Principal */}
      <main className="flex-1 h-[400px] md:h-full relative">
        <Card className="h-full rounded-none md:rounded-lg m-0 md:m-4 overflow-hidden shadow-xl">
          <MapaLeaflet
            paradas={paradas}
            onMapClick={handleMapClick}
            onEditClick={handleEditClick}
            onDeleteClick={setDeletingParada}
          />
        </Card>
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
