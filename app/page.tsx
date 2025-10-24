'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Key, X, Loader2, FileText, CheckCircle, Phone, Mail, MapPin, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

/**
 * Landing Page - Municipio de Lanús
 * Replica del diseño del PHP original (index.php)
 */
export default function Home() {
  const [isFinderOpen, setIsFinderOpen] = useState(false)
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false)
  const [dni, setDni] = useState('')
  const [email, setEmail] = useState('')
  const [requirementsEmail, setRequirementsEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [error, setError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')

  const handleFindCredential = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!dni.trim() || !email.trim()) {
      setError('Por favor, completa ambos campos.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/credenciales/buscar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni: dni.trim(),
          email: email.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirigir a la página de credencial con el token
        window.location.href = `/credencial/${data.token}`
      } else {
        setError(data.error || 'No se encontró una credencial activa con la combinación de DNI y email proporcionada.')
      }
    } catch (err) {
      console.error('Error al buscar credencial:', err)
      setError('Ocurrió un error en el servidor. Por favor, intente más tarde.')
    } finally {
      setLoading(false)
    }
  }

  const openFinder = () => {
    setIsFinderOpen(true)
    setError('')
    setDni('')
    setEmail('')
  }

  const openRequirements = () => {
    setIsRequirementsOpen(true)
    setEmailSuccess('')
    setRequirementsEmail('')
  }

  const handleSendRequirements = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailSuccess('')
    
    if (!requirementsEmail.trim()) {
      setEmailSuccess('Por favor, ingresa tu email.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(requirementsEmail)) {
      setEmailSuccess('El formato del email no es válido.')
      return
    }

    setSendingEmail(true)

    try {
      const response = await fetch('/api/requisitos/enviar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: requirementsEmail.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setEmailSuccess('✅ Requisitos enviados exitosamente. Revisá tu casilla de email.')
        setRequirementsEmail('')
      } else {
        setEmailSuccess(data.error || 'Error al enviar el email.')
      }
    } catch (err) {
      console.error('Error al enviar requisitos:', err)
      setEmailSuccess('Ocurrió un error. Por favor, intenta nuevamente.')
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div 
      className="min-h-screen" 
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}
    >
      <div className="w-full max-w-5xl mx-auto text-center px-4 py-12 md:py-20">
        
        {/* Header con logo y título */}
        <div className="animate-fade-in-up">
          <img 
            src="https://www.lanus.gob.ar/logo-200.png" 
            alt="Logo Lanús" 
            className="h-20 mx-auto mb-4"
          />
          <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">
            Gestión de Transporte
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            El portal de acceso para la administración y consulta de habilitaciones del Municipio de Lanús.
          </p>
        </div>

        {/* Dos tarjetas principales */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Tarjeta 1: Acceso Administrativo */}
          <Card className="animate-fade-in-up animation-delay-200 bg-white rounded-2xl shadow-lg border border-slate-200 p-10 text-left transform transition-transform duration-300 hover:-translate-y-2">
            <div className="bg-slate-100 text-slate-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Key className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Acceso Administrativo</h2>
            <p className="text-slate-500 mt-2 mb-6">
              Ingresá al panel para gestionar habilitaciones, usuarios y credenciales del sistema.
            </p>
            <Link href="/login" className="font-semibold text-slate-700 hover:text-sky-600 group transition-colors duration-300">
              Iniciar Sesión
              <span className="inline-block transform group-hover:translate-x-1 transition-transform ml-1">→</span>
            </Link>
          </Card>

          {/* Tarjeta 2: Soy Contribuyente */}
          <Card className="animate-fade-in-up animation-delay-400 bg-white rounded-2xl shadow-lg border border-slate-200 p-10 text-left transform transition-transform duration-300 hover:-translate-y-2">
            <div className="bg-sky-100 text-sky-700 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <CreditCard className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Soy Contribuyente</h2>
            <p className="text-slate-500 mt-2 mb-6">
              Consultá el estado de tu credencial digital o accedé a ella directamente.
            </p>
            <button 
              onClick={openFinder}
              className="font-semibold text-sky-600 hover:text-sky-800 group transition-colors duration-300"
            >
              Buscar mi Credencial
              <span className="inline-block transform group-hover:translate-x-1 transition-transform ml-1">→</span>
            </button>
          </Card>
        </div>

        {/* Botón de Requisitos */}
        <div className="mt-24">
          <Card className="bg-gradient-to-br from-orange-50 via-orange-50 to-amber-50 border-2 border-orange-200 p-12 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="bg-orange-500 text-white w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FileText className="h-10 w-10" />
              </div>
              <h2 className="text-4xl font-extrabold text-slate-800 mb-4">
                ¿Qué documentos necesitás?
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl">
                Conocé todos los requisitos y documentación necesaria para tramitar tu habilitación de transporte. Podés consultarlos y recibir el listado completo por email.
              </p>
              <Button
                onClick={openRequirements}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <FileText className="mr-2 h-5 w-5" />
                Ver Requisitos Completos
              </Button>
            </div>
          </Card>
        </div>

        {/* Información de Contacto */}
        <div className="mt-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-10 text-white shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold mb-2">¿Necesitás ayuda?</h2>
            <p className="text-blue-100">Estamos para asistirte en tu trámite</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6" />
              </div>
              <p className="font-semibold mb-1">Teléfono</p>
              <a href="tel:43575100" className="text-sm text-blue-100 hover:text-white transition-colors">
                4357-5100 int. 7137
              </a>
            </div>
            <div>
              <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6" />
              </div>
              <p className="font-semibold mb-1">Email</p>
              <a href="mailto:transportepublicolanus@gmail.com" className="text-sm text-blue-100 hover:text-white transition-colors break-all">
                transportepublicolanus@gmail.com
              </a>
            </div>
            <div>
              <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6" />
              </div>
              <p className="font-semibold mb-1">Dirección</p>
              <p className="text-sm text-blue-100">
                Intendente Manuel Quindimil 857<br />
                (esq. Jujuy) - Lanús
              </p>
            </div>
          </div>
        </div>

        {/* Modal de búsqueda de credencial */}
        {isFinderOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsFinderOpen(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Buscar mi Credencial</h3>
                  <p className="text-sm text-gray-500">
                    Ingresa tu DNI y Correo Electrónico para encontrar tu credencial digital activa.
                  </p>
                </div>
                <button
                  onClick={() => setIsFinderOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFindCredential} className="space-y-4 mt-6">
                {error && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <Label htmlFor="lookup_dni" className="block text-sm font-medium text-slate-600 mb-1 text-left">
                    DNI (sin puntos)
                  </Label>
                  <Input
                    type="text"
                    id="lookup_dni"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    required
                    placeholder="Tu número de DNI"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="lookup_email" className="block text-sm font-medium text-slate-600 mb-1 text-left">
                    Correo Electrónico
                  </Label>
                  <Input
                    type="email"
                    id="lookup_email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tu-correo@ejemplo.com"
                    className="w-full"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsFinderOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-sky-600 hover:bg-sky-700 min-w-[120px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      'Buscar'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Requisitos */}
        {isRequirementsOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsRequirementsOpen(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8 my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">Documentación Requerida</h3>
                  <p className="text-sm text-gray-500">
                    Listado completo de requisitos para cada tipo de habilitación
                  </p>
                </div>
                <button
                  onClick={() => setIsRequirementsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Transporte Escolar */}
                <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-xl p-6 max-h-[500px] overflow-y-auto">
                  <div className="flex items-center gap-3 mb-4 sticky top-0 bg-gradient-to-br from-blue-50 to-white pb-2">
                    <div className="bg-blue-500 text-white w-12 h-12 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">Transporte Escolar</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="text-[10px] text-slate-600 mb-3">✓ Unidad radicada en Provincia de Buenos Aires</p>
                    <p className="text-[10px]"><strong>1.</strong> Título y Cédula verde a nombre del solicitante</p>
                    <p className="text-[10px]"><strong>2.</strong> Póliza de Seguro categoría transporte escolar con cobertura terceros transportados y no transportados + último recibo</p>
                    <p className="text-[10px]"><strong>3.</strong> Certificación de escuela donde presta servicios</p>
                    <p className="text-[10px]"><strong>4.</strong> VTV como Transporte Escolar con ANEXO (categoría y capacidad de asientos)</p>
                    <p className="text-[10px]"><strong>5.</strong> Certificado de desinfección sanitaria</p>
                    <p className="text-[10px]"><strong>6.</strong> DNI (Titular, Chofer y Celador/a)</p>
                    <p className="text-[10px]"><strong>7.</strong> Libreta Sanitaria del Partido de Lanús (Titular, Chofer y Celador/a)</p>
                    <p className="text-[10px]"><strong>8.</strong> Licencia de Conducir con categoría Transporte Escolar (Titular - Chofer)</p>
                    <p className="text-[10px]"><strong>9.</strong> Certificado de Antecedentes Penales (Titular, Chofer y Celador/a)</p>
                    <p className="text-[10px]"><strong>10.</strong> Certificado de Domicilio (Titular, Chofer y Celador/a)</p>
                    <p className="text-[10px]"><strong>11.</strong> Constancia de CUIT o CUIL (Titular, chofer y celador/a)</p>
                    <p className="text-[10px]"><strong>12.</strong> Cédula Azul a nombre del Chofer (de corresponder)</p>
                    <p className="text-[10px]"><strong>13.</strong> Fotos color: unidad completa (delantera, trasera y laterales)</p>
                    <p className="text-[10px]"><strong>14.</strong> Colores reglamentarios: NARANJA (N°1054 IRAM) en carrocería baja y BLANCO en carrocería alta</p>
                    <p className="text-[10px]"><strong>15.</strong> Leyenda &quot;TRANSPORTE ESCOLAR&quot; visible (letra ≥20cm, color negro)</p>
                    <p className="text-[10px]"><strong>16.</strong> Psicotécnico (Titular, chofer y celador/a)</p>
                    <p className="text-[10px]"><strong>17.</strong> 02 Informes de Dominio</p>
                    <p className="text-[10px]"><strong>18.</strong> Último pago de patente (ARBA)</p>
                    <p className="text-[10px]"><strong>19.</strong> Constancia de Inscripción AFIP</p>
                    <p className="text-[10px]"><strong>20.</strong> Certificados de Deudores Alimentarios</p>
                    <p className="text-[10px]"><strong>21.</strong> Si es Persona Jurídica/Empresa: Estatuto o Contrato Social</p>
                    <p className="text-[10px] text-amber-700 mt-2"><strong>Renovación:</strong> Adjuntar fotocopia de la Resolución del año anterior</p>
                  </div>
                </div>

                {/* Remis */}
                <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-100 rounded-xl p-6 max-h-[500px] overflow-y-auto">
                  <div className="flex items-center gap-3 mb-4 sticky top-0 bg-gradient-to-br from-green-50 to-white pb-2">
                    <div className="bg-green-500 text-white w-12 h-12 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">Remis</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="text-[10px]"><strong>1.</strong> Solicitud de presentación de expediente ANEXO I</p>
                    <p className="text-[10px]"><strong>2.</strong> Título y Cédula Verde a nombre del solicitante</p>
                    <p className="text-[10px]"><strong>3.</strong> Póliza de Seguro categoría Remis con cobertura terceros transportados y no transportados + último recibo</p>
                    <p className="text-[10px]"><strong>4.</strong> VTV como Remis - Transporte Público de Pasajeros (hasta 9 personas)</p>
                    <p className="text-[10px]"><strong>5.</strong> Planilla de Desinfección Sanitaria (Empresa Habilitada N° 1928 - Email: Tecmatasara@yahoo.com.ar)</p>
                    <p className="text-[10px]"><strong>6.</strong> DNI (Titular y Chofer si lo tuviera)</p>
                    <p className="text-[10px]"><strong>7.</strong> Libreta Sanitaria del Partido de Lanús (de quien preste el servicio)</p>
                    <p className="text-[10px]"><strong>8.</strong> Licencia de Conducir con categoría habilitante Remis D.1 (Titular y Chofer)</p>
                    <p className="text-[10px]"><strong>9.</strong> Constancia de CUIL o CUIT (Titular y Chofer si lo tuviera)</p>
                    <p className="text-[10px]"><strong>10.</strong> Certificados de Antecedentes Penales (Titular y Chofer si lo tuviera)</p>
                    <p className="text-[10px]"><strong>11.</strong> Certificado de Declaración Jurada de Domicilio (Titular y Chofer)</p>
                    <p className="text-[10px]"><strong>12.</strong> Certificado de la Agencia HABILITADA EN LANÚS donde se explotará el Servicio</p>
                    <p className="text-[10px]"><strong>13.</strong> Certificado de GNC (ENERGAS)</p>
                    <p className="text-[10px]"><strong>14.</strong> Último pago de patente (ARBA o AGIP)</p>
                    <p className="text-[10px]"><strong>15.</strong> Constancia de inscripción de AFIP</p>
                    <p className="text-[10px]"><strong>16.</strong> Certificado de Deudores Alimentarios</p>
                    <p className="text-[10px] text-amber-700 mt-2"><strong>Renovación:</strong> Presentar Resolución del año anterior</p>
                    <p className="text-[10px] text-red-700 mt-1"><strong>Antigüedad:</strong> La unidad no debe exceder 15 años desde fabricación</p>
                    <p className="text-[10px] text-blue-700 mt-1"><strong>Inspección:</strong> Turno de Inspección Técnica será otorgado por la Dirección General de Movilidad y Transporte</p>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="border-t pt-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="bg-white p-4 rounded-xl shadow-md">
                        <QRCodeSVG
                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/requisitos`}
                          size={160}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                        <QrCode className="h-6 w-6 text-purple-600" />
                        <h4 className="text-lg font-bold text-slate-800">Escaneá con tu celular</h4>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">
                        Escaneá este código QR con la cámara de tu celular para acceder rápidamente desde tu móvil. 
                        Solo necesitás ingresar tu email.
                      </p>
                      <div className="inline-flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full text-xs text-slate-600">
                        📱 Optimizado para celular
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de Email */}
              <div className="border-t pt-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="h-6 w-6 text-blue-600" />
                    <h4 className="text-lg font-bold text-slate-800">O ingresá tu email directamente</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Te enviaremos el listado completo de requisitos a tu casilla de correo.
                  </p>
                  
                  <form onSubmit={handleSendRequirements} className="space-y-4">
                    {emailSuccess && (
                      <div className={`px-4 py-3 rounded-lg text-sm ${
                        emailSuccess.includes('✅') 
                          ? 'bg-green-100 border border-green-300 text-green-700' 
                          : 'bg-red-100 border border-red-300 text-red-700'
                      }`}>
                        {emailSuccess}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Input
                        type="email"
                        value={requirementsEmail}
                        onChange={(e) => setRequirementsEmail(e.target.value)}
                        placeholder="tu-correo@ejemplo.com"
                        className="flex-1"
                        disabled={sendingEmail}
                      />
                      <Button
                        type="submit"
                        disabled={sendingEmail}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {sendingEmail ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Enviar
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white/50 backdrop-blur-sm py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <img 
            src="https://www.lanus.gob.ar/logo-200.png" 
            alt="Logo Lanús" 
            className="h-12 mx-auto mb-4 opacity-70"
          />
          <p className="text-slate-600 text-sm font-medium mb-2">
            Municipio de Lanús - Dirección General de Movilidad y Transporte
          </p>
          <p className="text-slate-500 text-xs mb-4">
            © 2025 Todos los derechos reservados
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <Link href="/login" className="text-slate-600 hover:text-blue-600 transition-colors">
              Acceso Personal
            </Link>
            <span className="text-slate-400">|</span>
            <a 
              href="https://www.lanus.gob.ar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              Sitio Oficial
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
