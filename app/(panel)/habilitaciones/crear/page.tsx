'use client'

import { useState } from 'react'
import { ArrowLeft, Users, Car, Building, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PersonaFormWithOCR } from '@/components/forms/persona-form-with-ocr'

interface PersonaData {
  dni: string
  nombre: string
  apellido: string
  fecha_nacimiento: string
  genero: string
  nacionalidad: string
  domicilio_calle: string
  domicilio_nro: string
  domicilio_localidad: string
  telefono: string
  email: string
  foto_url: string
}

interface HabilitacionData {
  tipo_transporte: 'Escolar' | 'Remis'
  tipo: 'NUEVA' | 'RENOVACION'
  titular?: PersonaData
  conductor?: PersonaData
  celador?: PersonaData
  vehiculo?: any
  establecimiento?: any
}

export default function CrearHabilitacionPage() {
  const [paso, setPaso] = useState(1)
  const [habilitacion, setHabilitacion] = useState<HabilitacionData>({
    tipo_transporte: 'Escolar',
    tipo: 'NUEVA',
  })

  const pasos = [
    { numero: 1, titulo: 'Tipo de Habilitación', icono: FileText },
    { numero: 2, titulo: 'Titular', icono: Users },
    { numero: 3, titulo: 'Conductor', icono: Users },
    { numero: 4, titulo: 'Celador', icono: Users },
    { numero: 5, titulo: 'Vehículo', icono: Car },
    { numero: 6, titulo: 'Establecimiento', icono: Building },
    { numero: 7, titulo: 'Resumen', icono: CheckCircle },
  ]

  const handlePersonaCompleta = (
    rol: 'titular' | 'conductor' | 'celador',
    persona: PersonaData
  ) => {
    setHabilitacion(prev => ({
      ...prev,
      [rol]: persona,
    }))

    // Avanzar al siguiente paso
    setPaso(prev => prev + 1)
  }

  const renderPaso = () => {
    switch (paso) {
      case 1:
        return (
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Tipo de Habilitación</h2>

            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Tipo de Transporte
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() =>
                      setHabilitacion(prev => ({ ...prev, tipo_transporte: 'Escolar' }))
                    }
                    className={`rounded-lg border-2 p-6 text-center transition-all ${
                      habilitacion.tipo_transporte === 'Escolar'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="mb-2 text-4xl">🚌</div>
                    <div className="font-semibold">Transporte Escolar</div>
                    <div className="mt-1 text-sm text-gray-600">Para traslado de estudiantes</div>
                  </button>

                  <button
                    onClick={() => setHabilitacion(prev => ({ ...prev, tipo_transporte: 'Remis' }))}
                    className={`rounded-lg border-2 p-6 text-center transition-all ${
                      habilitacion.tipo_transporte === 'Remis'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="mb-2 text-4xl">🚗</div>
                    <div className="font-semibold">Remis</div>
                    <div className="mt-1 text-sm text-gray-600">
                      Servicio de transporte de pasajeros
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Tipo de Trámite
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setHabilitacion(prev => ({ ...prev, tipo: 'NUEVA' }))}
                    className={`rounded-lg border-2 p-4 text-center transition-all ${
                      habilitacion.tipo === 'NUEVA'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">Nueva Habilitación</div>
                    <div className="mt-1 text-sm text-gray-600">Primera vez</div>
                  </button>

                  <button
                    onClick={() => setHabilitacion(prev => ({ ...prev, tipo: 'RENOVACION' }))}
                    className={`rounded-lg border-2 p-4 text-center transition-all ${
                      habilitacion.tipo === 'RENOVACION'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">Renovación</div>
                    <div className="mt-1 text-sm text-gray-600">Habilitación existente</div>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button onClick={() => setPaso(2)} className="bg-blue-600 hover:bg-blue-700">
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <PersonaFormWithOCR
            rol="TITULAR"
            onPersonaCompleta={persona => handlePersonaCompleta('titular', persona)}
            onCancelar={() => setPaso(1)}
          />
        )

      case 3:
        return (
          <PersonaFormWithOCR
            rol="CONDUCTOR"
            onPersonaCompleta={persona => handlePersonaCompleta('conductor', persona)}
            onCancelar={() => setPaso(2)}
          />
        )

      case 4:
        return (
          <PersonaFormWithOCR
            rol="CELADOR"
            onPersonaCompleta={persona => handlePersonaCompleta('celador', persona)}
            onCancelar={() => setPaso(3)}
          />
        )

      case 5:
        return (
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">🚗 Datos del Vehículo</h2>
            <p className="mb-4 text-gray-600">Formulario de vehículo (por implementar)</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPaso(4)}>
                Anterior
              </Button>
              <Button onClick={() => setPaso(6)}>Continuar</Button>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">🏢 Establecimiento</h2>
            <p className="mb-4 text-gray-600">
              {habilitacion.tipo_transporte === 'Escolar'
                ? 'Seleccionar escuela (por implementar)'
                : 'Datos de remisería (por implementar)'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPaso(5)}>
                Anterior
              </Button>
              <Button onClick={() => setPaso(7)}>Continuar</Button>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">📋 Resumen de la Habilitación</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Tipo:</span>
                  <span className="ml-2">{habilitacion.tipo_transporte}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Trámite:</span>
                  <span className="ml-2">{habilitacion.tipo}</span>
                </div>
              </div>

              {habilitacion.titular && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-2 font-semibold text-gray-800">👤 Titular</h3>
                  <p>
                    {habilitacion.titular.nombre} {habilitacion.titular.apellido}
                  </p>
                  <p className="text-sm text-gray-600">DNI: {habilitacion.titular.dni}</p>
                </div>
              )}

              {habilitacion.conductor && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-2 font-semibold text-gray-800">🚗 Conductor</h3>
                  <p>
                    {habilitacion.conductor.nombre} {habilitacion.conductor.apellido}
                  </p>
                  <p className="text-sm text-gray-600">DNI: {habilitacion.conductor.dni}</p>
                </div>
              )}

              {habilitacion.celador && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-2 font-semibold text-gray-800">👥 Celador</h3>
                  <p>
                    {habilitacion.celador.nombre} {habilitacion.celador.apellido}
                  </p>
                  <p className="text-sm text-gray-600">DNI: {habilitacion.celador.dni}</p>
                </div>
              )}

              <div className="flex gap-3 pt-6">
                <Button variant="outline" onClick={() => setPaso(6)}>
                  Anterior
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">Crear Habilitación</Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <h1 className="text-xl font-bold text-blue-600">Nueva Habilitación</h1>
          <Link
            href="/habilitaciones"
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {pasos.map((pasoInfo, index) => {
              const Icono = pasoInfo.icono
              const esActual = paso === pasoInfo.numero
              const esCompletado = paso > pasoInfo.numero

              return (
                <div key={pasoInfo.numero} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      esCompletado
                        ? 'border-green-500 bg-green-500 text-white'
                        : esActual
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {esCompletado ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icono className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={`text-sm font-medium ${
                        esActual
                          ? 'text-blue-600'
                          : esCompletado
                            ? 'text-green-600'
                            : 'text-gray-500'
                      }`}
                    >
                      Paso {pasoInfo.numero}
                    </p>
                    <p
                      className={`text-xs ${
                        esActual
                          ? 'text-blue-500'
                          : esCompletado
                            ? 'text-green-500'
                            : 'text-gray-400'
                      }`}
                    >
                      {pasoInfo.titulo}
                    </p>
                  </div>
                  {index < pasos.length - 1 && (
                    <div
                      className={`mx-4 h-0.5 w-8 ${
                        paso > pasoInfo.numero ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Contenido del paso actual */}
        {renderPaso()}
      </main>
    </div>
  )
}
