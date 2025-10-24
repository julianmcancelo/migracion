import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Car,
  Bus,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Users,
  Building2,
  Sparkles,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/**
 * Landing Page - Municipio de Lanús
 * Sistema de Habilitaciones de Transporte
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Sticky Premium */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 shadow-sm backdrop-blur-xl transition-all">
        <div className="container mx-auto flex items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-blue-400/20 blur-xl"></div>
              <img
                src="https://www.lanus.gob.ar/logo-200.png"
                alt="Municipio de Lanús"
                className="relative h-12 w-auto sm:h-14"
              />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                Lanús Digital
              </h1>
              <p className="text-xs text-gray-600 sm:text-sm">Habilitaciones de Transporte</p>
            </div>
          </div>
          <Link href="/login">
            <Button className="group bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50">
              <Shield className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
              Acceso Personal
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Decorative background */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-blue-400/20 blur-3xl"></div>
          <div className="absolute right-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-indigo-400/20 blur-3xl" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container relative z-10 mx-auto px-6 text-center lg:px-8">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/60 px-6 py-2 shadow-sm backdrop-blur-sm">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Atendemos Lunes a Viernes 8:00 - 14:00 hs</span>
          </div>

          {/* Título Principal */}
          <h2 className="mx-auto mb-6 max-w-4xl text-5xl font-bold leading-tight tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Habilitaciones de
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Transporte Digital
            </span>
          </h2>

          <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-600 sm:text-xl">
            Gestión moderna y eficiente de trámites, inspecciones y renovaciones para transporte escolar y remis.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#servicios">
              <Button size="lg" className="group bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50">
                <Sparkles className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                Explorar Servicios
              </Button>
            </a>
            <a href="#contacto">
              <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 shadow-sm transition-all hover:scale-105 hover:bg-blue-50">
                <Phone className="mr-2 h-5 w-5" />
                Contacto
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Guardias Section */}
      <section id="guardias" className="bg-white py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h3 className="mb-4 text-4xl font-bold text-gray-900">Guardias y Horarios</h3>
            <p className="text-lg text-gray-600">Personal disponible para atención al público</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Guardia Principal */}
            <Card className="group overflow-hidden border-2 border-transparent p-8 shadow-xl transition-all hover:scale-105 hover:border-blue-300 hover:shadow-2xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">Guardia Principal</h4>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-green-700">Activo</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">Lunes a Viernes:</span>
                  <span>8:00 - 14:00 hs</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-500" />
                  <a href="tel:43575100" className="font-medium text-blue-600 hover:text-blue-700">
                    4357-5100 int. 7137
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
                  <span className="text-gray-700">Intendente Manuel Quindimil 857 (esq. Jujuy), Lanús</span>
                </div>
              </div>
            </Card>

            {/* Inspecciones */}
            <Card className="group overflow-hidden border-2 border-transparent p-8 shadow-xl transition-all hover:scale-105 hover:border-orange-300 hover:shadow-2xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 shadow-lg">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">Inspecciones</h4>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1">
                    <AlertCircle className="h-3 w-3 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Con Turno Previo</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">Lunes a Viernes:</span>
                  <span>9:00 - 13:00 hs</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">48hs de anticipación</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-orange-500" />
                  <a href="mailto:transportepublicolanus@gmail.com" className="font-medium text-orange-600 hover:text-orange-700">
                    transportepublicolanus@gmail.com
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Servicios Section */}
      <section id="servicios" className="bg-gradient-to-br from-slate-50 to-blue-50 py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h3 className="mb-4 text-4xl font-bold text-gray-900">Nuestros Servicios</h3>
            <p className="text-lg text-gray-600">Trámites y gestiones disponibles</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Transporte Escolar */}
            <Card className="group overflow-hidden border-2 border-transparent p-8 transition-all hover:scale-105 hover:border-blue-300 hover:shadow-2xl">
              <div className="mb-6">
                <div className="inline-block rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 shadow-lg transition-transform group-hover:scale-110">
                  <Bus className="h-10 w-10 text-white" />
                </div>
              </div>
              <h4 className="mb-3 text-2xl font-bold text-gray-900">Transporte Escolar</h4>
              <p className="mb-6 text-gray-600">
                Habilitaciones, renovaciones e inspecciones para servicios escolares.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Alta de habilitación
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Renovación anual
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Inspección técnica
                </li>
              </ul>
            </Card>

            {/* Remis */}
            <Card className="group overflow-hidden border-2 border-transparent p-8 transition-all hover:scale-105 hover:border-green-300 hover:shadow-2xl">
              <div className="mb-6">
                <div className="inline-block rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-4 shadow-lg transition-transform group-hover:scale-110">
                  <Car className="h-10 w-10 text-white" />
                </div>
              </div>
              <h4 className="mb-3 text-2xl font-bold text-gray-900">Remis</h4>
              <p className="mb-6 text-gray-600">
                Gestión completa de habilitaciones para servicios de remis.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Licencias de remis
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Cambio de vehículo
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Actualización de datos
                </li>
              </ul>
            </Card>

            {/* Turnos */}
            <Card className="group overflow-hidden border-2 border-transparent p-8 transition-all hover:scale-105 hover:border-orange-300 hover:shadow-2xl">
              <div className="mb-6">
                <div className="inline-block rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 shadow-lg transition-transform group-hover:scale-110">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
              </div>
              <h4 className="mb-3 text-2xl font-bold text-gray-900">Sistema de Turnos</h4>
              <p className="mb-6 text-gray-600">
                Agenda tu inspección online sin esperas ni demoras.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Solicitud online
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Confirmación por email
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Recordatorios automáticos
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Documentación Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h3 className="mb-2 text-3xl font-bold text-gray-900">Documentación Requerida</h3>
            <p className="text-gray-600">Qué necesitas para iniciar tu trámite</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 border-gray-200 p-6 shadow-lg transition-all hover:border-blue-300 hover:shadow-xl">
              <h4 className="mb-4 text-xl font-bold text-gray-900">Para Transporte Escolar</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="font-medium">DNI del titular</p>
                    <p className="text-sm text-gray-600">Original y fotocopia</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="font-medium">Cédula verde del vehículo</p>
                    <p className="text-sm text-gray-600">A nombre del titular</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="font-medium">Seguro vigente</p>
                    <p className="text-sm text-gray-600">Póliza contra terceros</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="font-medium">VTV vigente</p>
                    <p className="text-sm text-gray-600">Verificación técnica vehicular</p>
                  </div>
                </li>
              </ul>
            </Card>

            <Card className="border-2 border-gray-200 p-6 shadow-lg transition-all hover:border-green-300 hover:shadow-xl">
              <h4 className="mb-4 text-xl font-bold text-gray-900">Para Remis</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="font-medium">DNI y licencia de conducir</p>
                    <p className="text-sm text-gray-600">Del titular y conductores</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="font-medium">Título del vehículo</p>
                    <p className="text-sm text-gray-600">Original y copia certificada</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="font-medium">Certificado de antecedentes</p>
                    <p className="text-sm text-gray-600">Para todos los conductores</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="font-medium">Seguro y VTV</p>
                    <p className="text-sm text-gray-600">Vigentes y actualizados</p>
                  </div>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h3 className="mb-4 text-4xl font-bold text-gray-900">Contacto</h3>
            <p className="text-lg text-gray-600">Estamos para ayudarte</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <Card className="group border-2 border-transparent p-6 shadow-lg transition-all hover:scale-105 hover:border-blue-200 hover:shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-blue-100 to-blue-200 p-3 transition-colors group-hover:from-blue-200 group-hover:to-blue-300">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-bold">Dirección</h4>
              </div>
              <p className="mb-2 text-gray-700">Intendente Manuel Quindimil 857</p>
              <p className="mb-4 text-gray-700">(esquina Jujuy) - Lanús, Buenos Aires</p>
              <a
                href="https://maps.google.com/?q=Intendente+Manuel+Quindimil+857,+Lanus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                Ver en Google Maps
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Card>

            <Card className="group border-2 border-transparent p-6 shadow-lg transition-all hover:scale-105 hover:border-green-200 hover:shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-green-100 to-green-200 p-3 transition-colors group-hover:from-green-200 group-hover:to-green-300">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="text-lg font-bold">Teléfonos</h4>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Teléfono:</span>{' '}
                  <a href="tel:43575100" className="text-blue-600 hover:text-blue-700">
                    4357-5100 int. 7137
                  </a>
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Horario:</span> Lunes a Viernes 8:00 - 16:00 hs
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span>{' '}
                  <a href="mailto:transportepublicolanus@gmail.com" className="text-blue-600 hover:text-blue-700">
                    transportepublicolanus@gmail.com
                  </a>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-blue-600 to-indigo-600 py-12 text-white">
        <div className="container mx-auto px-6 text-center lg:px-8">
          <img
            src="https://www.lanus.gob.ar/logo-200.png"
            alt="Municipio de Lanús"
            className="mx-auto mb-6 h-16 w-auto opacity-90"
          />
          <p className="mb-2 font-medium">Municipio de Lanús - Dirección General de Movilidad y Transporte</p>
          <p className="text-sm text-blue-100">© 2025 Todos los derechos reservados</p>
          <div className="mt-6 flex items-center justify-center gap-6">
            <Link href="/login" className="text-sm text-blue-100 transition-colors hover:text-white">
              Acceso Personal
            </Link>
            <span className="text-blue-300">|</span>
            <a href="https://www.lanus.gob.ar" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-100 transition-colors hover:text-white">
              Sitio Oficial
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
