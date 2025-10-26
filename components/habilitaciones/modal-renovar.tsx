'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Loader2, RefreshCw, User, Car } from 'lucide-react'

interface ModalRenovarProps {
  habilitacion: {
    id: number
    nro_licencia: string | null
    expte: string | null
    tipo_transporte: string | null
    vigencia_fin: Date | null
    titular?: string
    vehiculo?: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalRenovar({ habilitacion, open, onOpenChange }: ModalRenovarProps) {
  const router = useRouter()
  const [nuevoExpediente, setNuevoExpediente] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [advertencias, setAdvertencias] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  
  // Checkboxes
  const [copiarTitular, setCopiarTitular] = useState(true)
  const [copiarVehiculo, setCopiarVehiculo] = useState(true)
  
  // Datos nuevos
  const [nuevoTitular, setNuevoTitular] = useState({ nombre: '', apellido: '', dni: '' })
  const [nuevoVehiculo, setNuevoVehiculo] = useState({ dominio: '', marca: '', modelo: '' })

  const handleRenovar = async () => {
    if (!nuevoExpediente.trim()) {
      setError('Debe ingresar el número de expediente')
      return
    }
    
    // Validar datos nuevos si no se copian
    if (!copiarTitular && (!nuevoTitular.nombre || !nuevoTitular.apellido || !nuevoTitular.dni)) {
      setError('Complete los datos del titular')
      return
    }
    
    if (!copiarVehiculo && (!nuevoVehiculo.dominio || !nuevoVehiculo.marca)) {
      setError('Complete los datos del vehículo')
      return
    }

    setLoading(true)
    setError(null)
    setAdvertencias([])

    try {
      const body: any = {
        nuevoExpediente: nuevoExpediente.trim(),
        copiarTitular,
        copiarVehiculo,
      }
      
      if (!copiarTitular) {
        body.nuevoTitular = nuevoTitular
      }
      
      if (!copiarVehiculo) {
        body.nuevoVehiculo = nuevoVehiculo
      }
      
      const res = await fetch(`/api/habilitaciones/${habilitacion.id}/renovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.advertencia && data.faltantes) {
          setAdvertencias(data.faltantes)
          setError('Hay documentos vencidos. ¿Desea continuar de todos modos?')
        } else {
          setError(data.error || 'Error al renovar la habilitación')
        }
        return
      }

      // Éxito
      setSuccess(true)
      if (data.advertencias && data.advertencias.length > 0) {
        setAdvertencias(data.advertencias)
      }

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/habilitaciones/${data.habilitacion_nueva.id}`)
        router.refresh()
      }, 2000)
    } catch (err) {
      console.error('Error al renovar:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleCerrar = () => {
    setNuevoExpediente('')
    setError(null)
    setAdvertencias([])
    setSuccess(false)
    setCopiarTitular(true)
    setCopiarVehiculo(true)
    setNuevoTitular({ nombre: '', apellido: '', dni: '' })
    setNuevoVehiculo({ dominio: '', marca: '', modelo: '' })
    onOpenChange(false)
  }

  const añoActual = new Date().getFullYear()

  return (
    <Dialog open={open} onOpenChange={handleCerrar}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            Renovar Habilitación {añoActual}
          </DialogTitle>
          <DialogDescription>
            Renueva esta habilitación de forma simple
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="mt-4 text-lg font-semibold text-green-900">✅ ¡Listo!</h3>
            <p className="mt-2 text-sm text-gray-600">Habilitación renovada exitosamente</p>
            <p className="mt-1 text-sm text-gray-500">Redirigiendo...</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Info simple */}
            <div className="rounded-lg border bg-blue-50 p-3">
              <p className="text-sm text-blue-900">
                📋 <strong>Licencia:</strong> {habilitacion.nro_licencia}
              </p>
              <p className="mt-1 text-xs text-blue-700">
                Se renovará para el año {añoActual}
              </p>
            </div>

            {/* Expediente */}
            <div>
              <Label htmlFor="expediente" className="text-sm font-medium">
                Nuevo Expediente <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expediente"
                placeholder="EXP-2025-0123"
                value={nuevoExpediente}
                onChange={(e) => setNuevoExpediente(e.target.value)}
                disabled={loading}
                className="mt-1.5"
              />
            </div>
            
            {/* Titular */}
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="copiarTitular"
                  checked={copiarTitular}
                  onChange={(e) => setCopiarTitular(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="copiarTitular" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <User className="h-4 w-4" />
                  Mantener mismo titular
                </Label>
              </div>
              
              {!copiarTitular && (
                <div className="space-y-2 pl-6">
                  <Input
                    placeholder="Nombre *"
                    value={nuevoTitular.nombre}
                    onChange={(e) => setNuevoTitular({ ...nuevoTitular, nombre: e.target.value })}
                    disabled={loading}
                  />
                  <Input
                    placeholder="Apellido *"
                    value={nuevoTitular.apellido}
                    onChange={(e) => setNuevoTitular({ ...nuevoTitular, apellido: e.target.value })}
                    disabled={loading}
                  />
                  <Input
                    placeholder="DNI *"
                    value={nuevoTitular.dni}
                    onChange={(e) => setNuevoTitular({ ...nuevoTitular, dni: e.target.value })}
                    disabled={loading}
                  />
                </div>
              )}
            </div>
            
            {/* Vehículo */}
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="copiarVehiculo"
                  checked={copiarVehiculo}
                  onChange={(e) => setCopiarVehiculo(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="copiarVehiculo" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <Car className="h-4 w-4" />
                  Mantener mismo vehículo
                </Label>
              </div>
              
              {!copiarVehiculo && (
                <div className="space-y-2 pl-6">
                  <Input
                    placeholder="Dominio (Ej: ABC123) *"
                    value={nuevoVehiculo.dominio}
                    onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, dominio: e.target.value.toUpperCase() })}
                    disabled={loading}
                    maxLength={7}
                  />
                  <Input
                    placeholder="Marca *"
                    value={nuevoVehiculo.marca}
                    onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })}
                    disabled={loading}
                  />
                  <Input
                    placeholder="Modelo"
                    value={nuevoVehiculo.modelo}
                    onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, modelo: e.target.value })}
                    disabled={loading}
                  />
                </div>
              )}
            </div>


            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCerrar} disabled={loading} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button onClick={handleRenovar} disabled={loading || !nuevoExpediente.trim()} className="flex-1 sm:flex-none">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renovando...
                </>
              ) : (
                '✅ Renovar'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
