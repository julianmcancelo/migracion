'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
<<<<<<< HEAD
import { ClipboardCheck, Plus, Calendar, CheckCircle, XCircle, AlertCircle, FileText, Mail } from 'lucide-react'
=======
import { ClipboardCheck, Plus, Calendar, CheckCircle, XCircle, AlertCircle, FileText, Mail, User, Car } from 'lucide-react'
>>>>>>> 01475c20185009700f2fe96b239069762f600db6
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Inspeccion {
  id: number
  habilitacion_id: number
  nro_licencia: string
  nombre_inspector: string
  fecha_inspeccion: string
  tipo_transporte: string
  resultado: string
  email_contribuyente?: string
<<<<<<< HEAD
  titular?: string | null
  dominio?: string | null
=======
  titular_nombre?: string
  titular_dni?: string
  vehiculo_patente?: string
  vehiculo_marca?: string
  vehiculo_modelo?: string
>>>>>>> 01475c20185009700f2fe96b239069762f600db6
}

/**
 * Página principal de inspecciones
 * Lista todas las inspecciones realizadas
 */
export default function InspeccionesPage() {
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([])
  const [loading, setLoading] = useState(true)
  const [enviandoEmail, setEnviandoEmail] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    cargarInspecciones()
  }, [])

  const cargarInspecciones = async () => {
    try {
      const response = await fetch('/api/inspecciones')
      const data = await response.json()
      
      if (data.success) {
        setInspecciones(data.data)
      }
    } catch (error) {
      console.error('Error al cargar inspecciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const getResultadoBadge = (resultado: string) => {
    const badges = {
      APROBADO: 'bg-green-100 text-green-800 border-green-300',
      CONDICIONAL: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      RECHAZADO: 'bg-red-100 text-red-800 border-red-300'
    }
    return badges[resultado as keyof typeof badges] || badges.APROBADO
  }

  const getResultadoIcon = (resultado: string) => {
    switch (resultado) {
      case 'APROBADO':
        return <CheckCircle className="h-4 w-4" />
      case 'RECHAZADO':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

<<<<<<< HEAD
  const enviarEmail = async (inspeccionId: number, email: string) => {
    if (!confirm(`¿Enviar informe de inspección a ${email}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/inspecciones/${inspeccionId}/enviar-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
=======
  const enviarPorEmail = async (inspeccionId: number, email: string) => {
    if (!email) {
      toast({
        title: 'Email no disponible',
        description: 'Esta inspección no tiene email registrado',
        variant: 'destructive'
      })
      return
    }

    setEnviandoEmail(inspeccionId)
    try {
      const response = await fetch(`/api/inspecciones/${inspeccionId}/enviar-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
>>>>>>> 01475c20185009700f2fe96b239069762f600db6
      })

      const data = await response.json()

      if (data.success) {
<<<<<<< HEAD
        alert('✅ Email enviado correctamente')
      } else {
        alert('❌ Error al enviar email: ' + (data.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error al enviar email:', error)
      alert('❌ Error al enviar email')
=======
        toast({
          title: '✅ Email enviado',
          description: `Inspección enviada exitosamente a ${email}`
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error al enviar',
        description: 'No se pudo enviar el email',
        variant: 'destructive'
      })
    } finally {
      setEnviandoEmail(null)
>>>>>>> 01475c20185009700f2fe96b239069762f600db6
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
            Inspecciones Vehiculares
          </h1>
          <p className="text-gray-600 mt-2">
            Gestión de inspecciones técnicas de vehículos
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/turnos">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              <Calendar className="h-5 w-5 mr-2" />
              Gestión de Turnos
            </Button>
          </Link>
          <Link href="/inspecciones/nueva">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              Nueva Inspección
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Aprobadas</p>
              <p className="text-2xl font-bold text-green-900">
                {inspecciones.filter(i => i.resultado === 'APROBADO').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Condicionales</p>
              <p className="text-2xl font-bold text-yellow-900">
                {inspecciones.filter(i => i.resultado === 'CONDICIONAL').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Rechazadas</p>
              <p className="text-2xl font-bold text-red-900">
                {inspecciones.filter(i => i.resultado === 'RECHAZADO').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Lista de Inspecciones */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Cargando inspecciones...
          </div>
        ) : inspecciones.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay inspecciones registradas</p>
            <Link href="/inspecciones/nueva">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-5 w-5 mr-2" />
                Crear Primera Inspección
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Licencia
                  </th>
<<<<<<< HEAD
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titular
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dominio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resultado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
=======
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titular / Vehículo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resultado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
>>>>>>> 01475c20185009700f2fe96b239069762f600db6
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inspecciones.map((inspeccion) => (
<<<<<<< HEAD
                  <tr key={inspeccion.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className="font-mono font-bold text-blue-600">
                        {inspeccion.nro_licencia}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="max-w-[150px] truncate" title={inspeccion.titular || '-'}>
                        {inspeccion.titular || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className="font-mono font-bold text-gray-900">
                        {inspeccion.dominio || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {inspeccion.nombre_inspector}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {inspeccion.tipo_transporte || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getResultadoBadge(inspeccion.resultado)}`}>
                        {getResultadoIcon(inspeccion.resultado)}
                        {inspeccion.resultado === 'APROBADO' ? 'aprobado' : inspeccion.resultado === 'RECHAZADO' ? 'rechazado' : 'condicional'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="max-w-[120px] truncate" title={inspeccion.email_contribuyente || '-'}>
                        {inspeccion.email_contribuyente || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
=======
                  <tr key={inspeccion.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-blue-600 text-base">
                          {inspeccion.nro_licencia}
                        </span>
                        <span className="text-xs text-gray-500">
                          {inspeccion.tipo_transporte || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                          <User className="h-4 w-4 text-gray-400" />
                          {inspeccion.titular_nombre || 'Sin datos'}
                        </div>
                        {inspeccion.titular_dni && (
                          <span className="text-xs text-gray-500 ml-6">DNI: {inspeccion.titular_dni}</span>
                        )}
                        <div className="flex items-center gap-2 text-gray-700 mt-1">
                          <Car className="h-4 w-4 text-gray-400" />
                          <span className="font-mono font-semibold">{inspeccion.vehiculo_patente || 'N/A'}</span>
                          {(inspeccion.vehiculo_marca || inspeccion.vehiculo_modelo) && (
                            <span className="text-xs text-gray-500">
                              {inspeccion.vehiculo_marca} {inspeccion.vehiculo_modelo}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {inspeccion.nombre_inspector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getResultadoBadge(inspeccion.resultado)}`}>
                        {getResultadoIcon(inspeccion.resultado)}
                        {inspeccion.resultado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
>>>>>>> 01475c20185009700f2fe96b239069762f600db6
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/inspecciones/${inspeccion.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
<<<<<<< HEAD
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-900 font-medium"
=======
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium transition-colors"
>>>>>>> 01475c20185009700f2fe96b239069762f600db6
                          title="Descargar PDF"
                        >
                          <FileText className="h-4 w-4" />
                          PDF
                        </a>
                        {inspeccion.email_contribuyente && (
<<<<<<< HEAD
                          <button
                            onClick={() => enviarEmail(inspeccion.id, inspeccion.email_contribuyente!)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 font-medium"
                            title="Enviar por email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
=======
                          <Button
                            onClick={() => enviarPorEmail(inspeccion.id, inspeccion.email_contribuyente!)}
                            disabled={enviandoEmail === inspeccion.id}
                            variant="ghost"
                            size="sm"
                            className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            title={`Enviar a ${inspeccion.email_contribuyente}`}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
>>>>>>> 01475c20185009700f2fe96b239069762f600db6
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
