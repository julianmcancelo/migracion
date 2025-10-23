'use client'

import { useState, useEffect } from 'react'
import { X, Search, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Habilitacion {
  id: number
  nro_licencia: string
  tipo_transporte: string
  vigencia_inicio: string
  vigencia_fin: string
  titular_principal: string | null
  personas: Array<{
    nombre: string
    dni: string
    email: string | null
    telefono: string | null
    rol: string
  }>
  vehiculos: Array<{
    dominio: string
    marca: string
    modelo: string
    ano: string
  }>
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
  precargarLicencia?: string
}

/**
 * Modal para crear o editar un turno
 */
export function ModalTurno({
  isOpen,
  onClose,
  onSuccess,
  turnoEdit,
  precargarLicencia = '',
}: ModalTurnoProps) {
  const [tipoTransporte, setTipoTransporte] = useState<'Escolar' | 'Remis'>('Escolar')
  const [busqueda, setBusqueda] = useState('')
  const [habilitaciones, setHabilitaciones] = useState<Habilitacion[]>([])
  const [buscando, setBuscando] = useState(false)
  const [habilitacionSeleccionada, setHabilitacionSeleccionada] = useState<Habilitacion | null>(
    null
  )

  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Cargar datos si es edición
  useEffect(() => {
    if (turnoEdit) {
      setFecha(turnoEdit.fecha ? turnoEdit.fecha.split('T')[0] : '')
      setHora(turnoEdit.hora ? turnoEdit.hora.split('T')[1]?.substring(0, 5) || '' : '')
      setObservaciones(turnoEdit.observaciones || '')
      setBusqueda(turnoEdit.habilitacion?.nro_licencia || '')
    } else {
      limpiarFormulario()
      // Si hay una licencia precargada, iniciar búsqueda
      if (precargarLicencia) {
        setBusqueda(precargarLicencia)
      }
    }
  }, [turnoEdit, isOpen, precargarLicencia])

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
            observaciones,
          }),
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
            observaciones,
          }),
        })

        const data = await response.json()

        if (data.success) {
          // Mostrar mensaje de éxito con info del email
          const mensajeEmail = data.email_enviado
            ? '\n\n✅ Email de confirmación enviado al titular.'
            : '\n\n⚠️ El titular no tiene email registrado.'

          alert('✅ Turno creado exitosamente!' + mensajeEmail)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {turnoEdit ? 'Editar Turno' : 'Nuevo Turno'}
          </h2>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="space-y-6 p-6">
          {/* Selector de Tipo de Transporte */}
          {!turnoEdit && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tipo de Transporte *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoTransporte('Escolar')}
                  className={`rounded-lg border-2 px-4 py-3 font-medium transition-all ${
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
                  className={`rounded-lg border-2 px-4 py-3 font-medium transition-all ${
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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Buscar Habilitación {tipoTransporte} *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar por Nro. Licencia, DNI o Nombre..."
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  disabled={!!habilitacionSeleccionada}
                />
                {habilitacionSeleccionada && (
                  <button
                    onClick={() => {
                      setHabilitacionSeleccionada(null)
                      setBusqueda('')
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Resultados de búsqueda */}
              {habilitaciones.length > 0 && !habilitacionSeleccionada && (
                <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200 shadow-lg">
                  {habilitaciones.map(hab => (
                    <button
                      key={hab.id}
                      onClick={() => seleccionarHabilitacion(hab)}
                      className="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="font-mono text-base font-bold text-blue-600">
                              {hab.nro_licencia}
                            </p>
                            <span
                              className={`rounded px-2 py-0.5 text-xs font-semibold ${
                                new Date(hab.vigencia_fin) > new Date()
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {new Date(hab.vigencia_fin) > new Date() ? 'Vigente' : 'Vencida'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{hab.tipo_transporte}</p>

                          {/* Datos del Titular */}
                          {hab.titular_principal && (
                            <div className="mt-2 text-xs">
                              <span className="font-medium text-gray-700">Titular: </span>
                              <span className="text-gray-900">{hab.titular_principal}</span>
                            </div>
                          )}

                          {/* Datos del Vehículo */}
                          {hab.vehiculos && hab.vehiculos.length > 0 && (
                            <div className="mt-1 text-xs">
                              <span className="font-medium text-gray-700">Vehículo: </span>
                              <span className="text-gray-900">
                                {hab.vehiculos[0].marca} {hab.vehiculos[0].modelo} -{' '}
                                {hab.vehiculos[0].dominio}
                              </span>
                            </div>
                          )}

                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Vigencia desde:</span>
                              <br />
                              {new Date(hab.vigencia_inicio).toLocaleDateString('es-AR')}
                            </div>
                            <div>
                              <span className="font-medium">Vigencia hasta:</span>
                              <br />
                              {new Date(hab.vigencia_fin).toLocaleDateString('es-AR')}
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

              {!buscando &&
                busqueda.length >= 3 &&
                habilitaciones.length === 0 &&
                !habilitacionSeleccionada && (
                  <div className="mt-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-800">
                      No se encontraron habilitaciones de tipo <strong>{tipoTransporte}</strong> con
                      el término &quot;{busqueda}&quot;
                    </p>
                    <p className="mt-1 text-xs text-yellow-700">
                      Intenta cambiar el tipo de transporte o buscar con otro término
                    </p>
                  </div>
                )}

              {habilitacionSeleccionada && (
                <div className="mt-3 rounded-lg border-2 border-green-300 bg-gradient-to-r from-green-50 to-blue-50 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500"></div>
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
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-semibold ${
                              new Date(habilitacionSeleccionada.vigencia_fin) > new Date()
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {new Date(habilitacionSeleccionada.vigencia_fin) > new Date()
                              ? 'Vigente'
                              : 'Vencida'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600">Tipo:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {habilitacionSeleccionada.tipo_transporte}
                          </span>
                        </div>

                        {/* Datos del Titular */}
                        {habilitacionSeleccionada.titular_principal && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600">Titular:</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {habilitacionSeleccionada.titular_principal}
                            </span>
                          </div>
                        )}

                        {/* Datos del Vehículo */}
                        {habilitacionSeleccionada.vehiculos &&
                          habilitacionSeleccionada.vehiculos.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs font-medium text-gray-600">Vehículo:</span>
                              <p className="text-sm font-semibold text-gray-900">
                                {habilitacionSeleccionada.vehiculos[0].marca}{' '}
                                {habilitacionSeleccionada.vehiculos[0].modelo}
                              </p>
                              <p className="text-xs text-gray-600">
                                Dominio:{' '}
                                <span className="font-semibold">
                                  {habilitacionSeleccionada.vehiculos[0].dominio}
                                </span>{' '}
                                | Año:{' '}
                                <span className="font-semibold">
                                  {habilitacionSeleccionada.vehiculos[0].ano}
                                </span>
                              </p>
                            </div>
                          )}

                        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-green-200 pt-3">
                          <div>
                            <span className="text-xs font-medium text-gray-600">
                              Vigencia desde
                            </span>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(
                                habilitacionSeleccionada.vigencia_inicio
                              ).toLocaleDateString('es-AR')}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-600">
                              Vigencia hasta
                            </span>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(habilitacionSeleccionada.vigencia_fin).toLocaleDateString(
                                'es-AR'
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-3xl">{tipoTransporte === 'Escolar' ? '🚌' : '🚕'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {turnoEdit && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                Licencia: {turnoEdit.habilitacion?.nro_licencia}
              </p>
              <p className="mt-1 text-xs text-blue-700">
                No se puede cambiar la habilitación en un turno existente
              </p>
            </div>
          )}

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Calendar className="mr-1 inline h-4 w-4" />
                Fecha del Turno *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                disabled={!!turnoEdit}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Clock className="mr-1 inline h-4 w-4" />
                Hora del Turno *
              </label>
              <input
                type="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                disabled={!!turnoEdit}
              />
            </div>
          </div>

          {turnoEdit && (
            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              ℹ️ Solo se pueden editar las observaciones. Para cambiar fecha/hora, cancele este
              turno y cree uno nuevo.
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Detalles adicionales del turno..."
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6">
          <Button variant="outline" onClick={onClose} disabled={guardando}>
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
