'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { HabilitacionFormData } from '@/lib/validations/habilitacion'
import { DatosBasicosStep } from './nueva-habilitacion/datos-basicos-step'
import { PersonasStep } from './nueva-habilitacion/personas-step'
import { VehiculosStep } from './nueva-habilitacion/vehiculos-step'
import { EstablecimientosStep } from './nueva-habilitacion/establecimientos-step'

interface NuevaHabilitacionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const PASOS = [
  { id: 1, titulo: 'Datos Básicos', descripcion: 'Información general de la habilitación' },
  { id: 2, titulo: 'Personas', descripcion: 'Titular, conductores y celadores' },
  { id: 3, titulo: 'Vehículos', descripcion: 'Vehículos vinculados' },
  { id: 4, titulo: 'Establecimientos', descripcion: 'Establecimientos o remiserías' },
]

/**
 * Dialog con formulario multi-paso para crear nueva habilitación
 */
export function NuevaHabilitacionDialog({
  open,
  onOpenChange,
  onSuccess,
}: NuevaHabilitacionDialogProps) {
  const [pasoActual, setPasoActual] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estado del formulario
  const [formData, setFormData] = useState<Partial<HabilitacionFormData>>({
    tipo_transporte: 'Escolar',
    estado: 'INICIADO',
    oblea_colocada: false,
    personas: [],
    vehiculos: [],
    establecimientos: [],
  })

  const handleNext = () => {
    setError(null)
    if (pasoActual < PASOS.length) {
      setPasoActual(pasoActual + 1)
    }
  }

  const handleBack = () => {
    setError(null)
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Validar que tenga al menos una persona y un vehículo
      if (!formData.personas || formData.personas.length === 0) {
        throw new Error('Debe agregar al menos una persona')
      }
      if (!formData.vehiculos || formData.vehiculos.length === 0) {
        throw new Error('Debe agregar al menos un vehículo')
      }

      const response = await fetch('/api/habilitaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear habilitación')
      }

      // Resetear formulario
      setFormData({
        tipo_transporte: 'Escolar',
        estado: 'INICIADO',
        oblea_colocada: false,
        personas: [],
        vehiculos: [],
        establecimientos: [],
      })
      setPasoActual(1)
      onOpenChange(false)
      onSuccess?.()

    } catch (err: any) {
      console.error('Error al crear habilitación:', err)
      setError(err.message || 'Error al crear habilitación')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (data: Partial<HabilitacionFormData>) => {
    setFormData((prev: Partial<HabilitacionFormData>) => ({ ...prev, ...data }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Habilitación</DialogTitle>
        </DialogHeader>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-between mb-6">
          {PASOS.map((paso, index) => (
            <div key={paso.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    pasoActual === paso.id
                      ? 'bg-blue-600 text-white'
                      : pasoActual > paso.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {paso.id}
                </div>
                <div className="text-xs font-medium mt-2 text-center">
                  {paso.titulo}
                </div>
              </div>
              {index < PASOS.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-colors ${
                    pasoActual > paso.id ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Contenido del paso actual */}
        <div className="py-4">
          {pasoActual === 1 && (
            <DatosBasicosStep
              data={formData}
              onChange={updateFormData}
            />
          )}
          {pasoActual === 2 && (
            <PersonasStep
              personas={formData.personas || []}
              onChange={(personas) => updateFormData({ personas })}
            />
          )}
          {pasoActual === 3 && (
            <VehiculosStep
              vehiculos={formData.vehiculos || []}
              onChange={(vehiculos) => updateFormData({ vehiculos })}
            />
          )}
          {pasoActual === 4 && (
            <EstablecimientosStep
              establecimientos={formData.establecimientos || []}
              onChange={(establecimientos) => updateFormData({ establecimientos })}
              tipoTransporte={formData.tipo_transporte}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={pasoActual === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="text-sm text-gray-500">
            Paso {pasoActual} de {PASOS.length}
          </div>

          {pasoActual < PASOS.length ? (
            <Button onClick={handleNext} disabled={loading}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Habilitación'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
