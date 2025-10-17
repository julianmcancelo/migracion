'use client'

import { useState, useEffect } from 'react'
import { X, Search, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Habilitacion {
  id: number
  nro_licencia: string
  tipo: string
  vigencia_desde: string
  vigencia_hasta: string
}

interface ModalTurnoProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  turnoEdit?: {
    id: number
    habilitacion_id: number
    fecha: string
    hora: string
    observaciones?: string
    habilitacion?: {
      nro_licencia: string
    }
  } | null
}

/**
 * Modal para crear o editar un turno
 */
export function ModalTurno({ isOpen, onClose, onSuccess, turnoEdit }: ModalTurnoProps) {
  const [tipoTransporte, setTipoTransporte] = useState<'Escolar' | 'Remis'>('Escolar')
  const [busqueda, setBusqueda] = useState('')
  const [habilitaciones, setHabilitaciones] = useState<Habilitacion[]>([])
  const [buscando, setBuscando] = useState(false)
  const [habilitacionSeleccionada, setHabilitacionSeleccionada] = useState<Habilitacion | null>(null)
  
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Cargar datos si es edición
  useEffect(() => {
    if (turnoEdit) {
      setFecha(turnoEdit.fecha.split('T')[0])
      setHora(turnoEdit.hora.split('T')[1]?.substring(0, 5) || '')
      setObservaciones(turnoEdit.observaciones || '')
      setBusqueda(turnoEdit.habilitacion?.nro_licencia || '')
    } else {
      limpiarFormulario()
    }
  }, [turnoEdit, isOpen])

  const limpiarFormulario = () => {
    setTipoTransporte('Escolar')
    setBusqueda('')
    setHabilitaciones([])
    setHabilitacionSeleccionada(null)
    setFecha('')
    setHora('')
    setObservaciones('')
  }

  const buscarHabilitaciones = async () => {
    if (busqueda.length < 3) {
      setHabilitaciones([])
      return
    }

    setBuscando(true)
    try {
      const response = await fetch(`/api/habilitaciones?search=${busqueda}&tipo=${tipoTransporte}`)
      const data = await response.json()
      
      if (data.success) {
        setHabilitaciones(data.data.slice(0, 10)) // Limitar a 10 resultados
      }
    } catch (error) {
      console.error('Error al buscar habilitaciones:', error)
    } finally {
      setBuscando(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!turnoEdit && busqueda.length >= 3) {
        buscarHabilitaciones()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [busqueda, tipoTransporte])

  // Limpiar selección cuando cambia el tipo de transporte
  useEffect(() => {
    if (!turnoEdit) {
      setHabilitacionSeleccionada(null)
      setBusqueda('')
      setHabilitaciones([])
    }
  }, [tipoTransporte])

  const seleccionarHabilitacion = (hab: Habilitacion) => {
    setHabilitacionSeleccionada(hab)
    setBusqueda(hab.nro_licencia)
    setHabilitaciones([])
  }

  const guardarTurno = async () => {
    // Validaciones
    if (!turnoEdit && !habilitacionSeleccionada) {
      alert('Debe seleccionar una habilitación')
      return
    }

    if (!fecha || !hora) {
      alert('Complete fecha y hora del turno')
      return
    }

    setGuardando(true)

    try {
      if (turnoEdit) {
        // Actualizar turno existente
        const response = await fetch(`/api/turnos/${turnoEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            observaciones
          })
        })

        const data = await response.json()

        if (data.success) {
          onSuccess()
          onClose()
        } else {
          alert('Error: ' + data.error)
        }
      } else {
        // Crear nuevo turno
        const response = await fetch('/api/turnos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            habilitacion_id: habilitacionSeleccionada!.id,
            fecha,
            hora,
            observaciones
          })
        })

        const data = await response.json()

        if (data.success) {
          onSuccess()
          onClose()
          limpiarFormulario()
        } else {
          alert('Error: ' + data.error)
        }
      }
    } catch (error) {
      console.error('Error al guardar turno:', error)
      alert('Error al guardar el turno')
    } finally {
      setGuardando(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {turnoEdit ? 'Editar Turno' : 'Nuevo Turno'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Selector de Tipo de Transporte */}
          {!turnoEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Transporte *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoTransporte('Escolar')}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    tipoTransporte === 'Escolar'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  🚌 Transporte Escolar
                </button>
                <button
                  type="button"
                  onClick={() => setTipoTransporte('Remis')}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    tipoTransporte === 'Remis'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  🚕 Remis
                </button>
              </div>
            </div>
          )}

          {/* Búsqueda de Habilitación */}
          {!turnoEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Habilitación {tipoTransporte} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por Nro. Licencia, DNI o Nombre..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!!habilitacionSeleccionada}
                />
                {habilitacionSeleccionada && (
                  <button
                    onClick={() => {
                      setHabilitacionSeleccionada(null)
                      setBusqueda('')
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Resultados de búsqueda */}
              {habilitaciones.length > 0 && !habilitacionSeleccionada && (
                <div className="mt-2 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {habilitaciones.map((hab) => (
                    <button
                      key={hab.id}
                      onClick={() => seleccionarHabilitacion(hab)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-mono font-bold text-blue-600 text-base">
                              {hab.nro_licencia}
                            </p>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              new Date(hab.vigencia_hasta) > new Date()
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {new Date(hab.vigencia_hasta) > new Date() ? 'Vigente' : 'Vencida'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {hab.tipo}
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Vigencia desde:</span>
                              <br />
                              {new Date(hab.vigencia_desde).toLocaleDateString('es-AR')}
                            </div>
                            <div>
                              <span className="font-medium">Vigencia hasta:</span>
                              <br />
                              {new Date(hab.vigencia_hasta).toLocaleDateString('es-AR')}
                            </div>
                          </div>
                        </div>
                        <span className="text-2xl">
                          {tipoTransporte === 'Escolar' ? '🚌' : '🚕'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {buscando && (
                <p className="mt-2 text-sm text-gray-500">
                  🔍 Buscando habilitaciones de tipo {tipoTransporte}...
                </p>
              )}

              {!buscando && busqueda.length >= 3 && habilitaciones.length === 0 && !habilitacionSeleccionada && (
                <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No se encontraron habilitaciones de tipo <strong>{tipoTransporte}</strong> con el término "{busqueda}"
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Intenta cambiar el tipo de transporte o buscar con otro término
                  </p>
                </div>
              )}

              {habilitacionSeleccionada && (
                <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-green-900">
                          Habilitación Seleccionada
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600">Licencia:</span>
                          <span className="font-mono font-bold text-blue-600">
                            {habilitacionSeleccionada.nro_licencia}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            new Date(habilitacionSeleccionada.vigencia_hasta) > new Date()
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {new Date(habilitacionSeleccionada.vigencia_hasta) > new Date() ? 'Vigente' : 'Vencida'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600">Tipo:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {habilitacionSeleccionada.tipo}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-green-200">
                          <div>
                            <span className="text-xs font-medium text-gray-600">Vigencia desde</span>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(habilitacionSeleccionada.vigencia_desde).toLocaleDateString('es-AR')}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-600">Vigencia hasta</span>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(habilitacionSeleccionada.vigencia_hasta).toLocaleDateString('es-AR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-3xl">
                      {tipoTransporte === 'Escolar' ? '🚌' : '🚕'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {turnoEdit && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                Licencia: {turnoEdit.habilitacion?.nro_licencia}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                No se puede cambiar la habilitación en un turno existente
              </p>
            </div>
          )}

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Fecha del Turno *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!!turnoEdit}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Hora del Turno *
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!!turnoEdit}
              />
            </div>
          </div>

          {turnoEdit && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              ℹ️ Solo se pueden editar las observaciones. Para cambiar fecha/hora, cancele este turno y cree uno nuevo.
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Detalles adicionales del turno..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button
            onClick={guardarTurno}
            disabled={guardando || (!turnoEdit && !habilitacionSeleccionada) || !fecha || !hora}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {guardando ? 'Guardando...' : turnoEdit ? 'Actualizar Turno' : 'Crear Turno'}
          </Button>
        </div>
      </div>
    </div>
  )
}
