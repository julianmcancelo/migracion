'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
      // Validación relajada para facilitar la carga
      // Ya no es obligatorio tener personas y vehículos al crear

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
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Habilitación</DialogTitle>
        </DialogHeader>

        {/* Indicador de pasos */}
        <div className="mb-6 flex items-center justify-between">
          {PASOS.map((paso, index) => (
            <div key={paso.id} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors ${pasoActual === paso.id
                    ? 'bg-blue-600 text-white'
                    : pasoActual > paso.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }`}
                >
                  {paso.id}
                </div>
                <div className="mt-2 text-center text-xs font-medium">{paso.titulo}</div>
              </div>
              {index < PASOS.length - 1 && (
                <div
                  className={`mx-2 h-1 flex-1 transition-colors ${pasoActual > paso.id ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Contenido del paso actual */}
        <div className="py-4">
          {pasoActual === 1 && <DatosBasicosStep data={formData} onChange={updateFormData} />}
          {pasoActual === 2 && (
            <PersonasStep
              personas={formData.personas || []}
              onChange={personas => updateFormData({ personas })}
            />
          )}
          {pasoActual === 3 && (
            <VehiculosStep
              vehiculos={formData.vehiculos || []}
              onChange={vehiculos => updateFormData({ vehiculos })}
            />
          )}
          {pasoActual === 4 && (
            <EstablecimientosStep
              establecimientos={formData.establecimientos || []}
              onChange={establecimientos => updateFormData({ establecimientos })}
              tipoTransporte={formData.tipo_transporte}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack} disabled={pasoActual === 1 || loading}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            {pasoActual < PASOS.length && (
              <Button variant="secondary" onClick={handleSubmit} disabled={loading}>
                Guardar Borrador
              </Button>
            )}
          </div>

          <div className="text-sm text-gray-500">
            Paso {pasoActual} de {PASOS.length}
          </div>

          {pasoActual < PASOS.length ? (
            <Button onClick={handleNext} disabled={loading}>
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
