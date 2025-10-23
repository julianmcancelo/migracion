'use client'

import { useState, useEffect } from 'react'
import { User, Scan, Edit3, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DNIUploader } from '@/components/ocr/dni-uploader'

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

interface PersonaFormWithOCRProps {
  rol: 'TITULAR' | 'CONDUCTOR' | 'CELADOR'
  onPersonaCompleta: (persona: PersonaData) => void
  onCancelar?: () => void
  personaInicial?: Partial<PersonaData>
  disabled?: boolean
}

export function PersonaFormWithOCR({
  rol,
  onPersonaCompleta,
  onCancelar,
  personaInicial,
  disabled = false,
}: PersonaFormWithOCRProps) {
  const [mostrarOCR, setMostrarOCR] = useState(false)
  const [persona, setPersona] = useState<PersonaData>({
    dni: '',
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    genero: '',
    nacionalidad: 'ARGENTINA',
    domicilio_calle: '',
    domicilio_nro: '',
    domicilio_localidad: 'LANÚS',
    telefono: '',
    email: '',
    foto_url: '',
    ...personaInicial,
  })

  const [errores, setErrores] = useState<Record<string, string>>({})

  const handleDatosOCR = (datosExtraidos: any) => {
    console.log('Datos del OCR:', datosExtraidos)

    // Mapear datos del OCR al formulario
    const nuevaPersona = { ...persona }

    if (datosExtraidos.dni) {
      nuevaPersona.dni = datosExtraidos.dni
    }

    if (datosExtraidos.nombre) {
      nuevaPersona.nombre = datosExtraidos.nombre
    }

    if (datosExtraidos.apellido) {
      nuevaPersona.apellido = datosExtraidos.apellido
    }

    if (datosExtraidos.fechaNacimiento) {
      nuevaPersona.fecha_nacimiento = datosExtraidos.fechaNacimiento
    }

    if (datosExtraidos.sexo) {
      nuevaPersona.genero = datosExtraidos.sexo
    }

    if (datosExtraidos.nacionalidad) {
      nuevaPersona.nacionalidad = datosExtraidos.nacionalidad
    }

    if (datosExtraidos.domicilio) {
      // Intentar separar calle y número del domicilio
      const domicilioPartes = datosExtraidos.domicilio.match(/^(.+?)\s+(\d+.*?)$/)
      if (domicilioPartes) {
        nuevaPersona.domicilio_calle = domicilioPartes[1].trim()
        nuevaPersona.domicilio_nro = domicilioPartes[2].trim()
      } else {
        nuevaPersona.domicilio_calle = datosExtraidos.domicilio
      }
    }

    setPersona(nuevaPersona)
    setMostrarOCR(false)

    // Limpiar errores de campos que se llenaron
    const nuevosErrores = { ...errores }
    Object.keys(datosExtraidos).forEach(key => {
      if (datosExtraidos[key]) {
        delete nuevosErrores[key]
      }
    })
    setErrores(nuevosErrores)
  }

  const handleInputChange = (field: keyof PersonaData, value: string) => {
    setPersona(prev => ({ ...prev, [field]: value }))

    // Limpiar error del campo
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {}

    if (!persona.dni.trim()) {
      nuevosErrores.dni = 'DNI es requerido'
    } else if (!/^\d{7,8}$/.test(persona.dni)) {
      nuevosErrores.dni = 'DNI debe tener 7 u 8 dígitos'
    }

    if (!persona.nombre.trim()) {
      nuevosErrores.nombre = 'Nombre es requerido'
    }

    if (!persona.apellido.trim()) {
      nuevosErrores.apellido = 'Apellido es requerido'
    }

    if (!persona.fecha_nacimiento) {
      nuevosErrores.fecha_nacimiento = 'Fecha de nacimiento es requerida'
    }

    if (!persona.genero) {
      nuevosErrores.genero = 'Género es requerido'
    }

    if (persona.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(persona.email)) {
      nuevosErrores.email = 'Email no válido'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validarFormulario()) {
      onPersonaCompleta(persona)
    }
  }

  const getRolIcon = () => {
    switch (rol) {
      case 'TITULAR':
        return '👤'
      case 'CONDUCTOR':
        return '🚗'
      case 'CELADOR':
        return '👥'
      default:
        return '👤'
    }
  }

  const getRolColor = () => {
    switch (rol) {
      case 'TITULAR':
        return 'bg-blue-500'
      case 'CONDUCTOR':
        return 'bg-green-500'
      case 'CELADOR':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`h-12 w-12 ${getRolColor()} flex items-center justify-center rounded-full text-xl text-white`}
          >
            {getRolIcon()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Datos del {rol.toLowerCase()}</h3>
            <p className="text-sm text-gray-600">Complete la información de la persona</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => setMostrarOCR(!mostrarOCR)}
            variant="outline"
            className="border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
            disabled={disabled}
          >
            <Scan className="mr-2 h-4 w-4" />
            {mostrarOCR ? 'Ocultar OCR' : 'Escanear DNI'}
          </Button>
        </div>
      </div>

      {/* OCR Section */}
      {mostrarOCR && (
        <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
          <h4 className="mb-3 font-semibold text-purple-800">📷 Escanear DNI con OCR</h4>
          <DNIUploader
            onDatosExtraidos={handleDatosOCR}
            onError={error => console.error('Error OCR:', error)}
            disabled={disabled}
          />
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos personales */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">DNI *</label>
            <input
              type="text"
              value={persona.dni}
              onChange={e => handleInputChange('dni', e.target.value.replace(/\D/g, ''))}
              className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                errores.dni ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12345678"
              maxLength={8}
              disabled={disabled}
            />
            {errores.dni && <p className="mt-1 text-xs text-red-500">{errores.dni}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Género *</label>
            <select
              value={persona.genero}
              onChange={e => handleInputChange('genero', e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                errores.genero ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={disabled}
            >
              <option value="">Seleccionar...</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
            </select>
            {errores.genero && <p className="mt-1 text-xs text-red-500">{errores.genero}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Nombre *</label>
            <input
              type="text"
              value={persona.nombre}
              onChange={e => handleInputChange('nombre', e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                errores.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Juan Carlos"
              disabled={disabled}
            />
            {errores.nombre && <p className="mt-1 text-xs text-red-500">{errores.nombre}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Apellido *</label>
            <input
              type="text"
              value={persona.apellido}
              onChange={e => handleInputChange('apellido', e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                errores.apellido ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Pérez González"
              disabled={disabled}
            />
            {errores.apellido && <p className="mt-1 text-xs text-red-500">{errores.apellido}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              value={persona.fecha_nacimiento}
              onChange={e => handleInputChange('fecha_nacimiento', e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                errores.fecha_nacimiento ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={disabled}
            />
            {errores.fecha_nacimiento && (
              <p className="mt-1 text-xs text-red-500">{errores.fecha_nacimiento}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Nacionalidad</label>
            <input
              type="text"
              value={persona.nacionalidad}
              onChange={e => handleInputChange('nacionalidad', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Argentina"
              disabled={disabled}
            />
          </div>
        </div>

        {/* Domicilio */}
        <div className="space-y-4">
          <h4 className="border-b pb-2 font-semibold text-gray-800">📍 Domicilio</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Calle</label>
              <input
                type="text"
                value={persona.domicilio_calle}
                onChange={e => handleInputChange('domicilio_calle', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Av. Hipólito Yrigoyen"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Número</label>
              <input
                type="text"
                value={persona.domicilio_nro}
                onChange={e => handleInputChange('domicilio_nro', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="1234"
                disabled={disabled}
              />
            </div>
            <div className="md:col-span-3">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Localidad</label>
              <input
                type="text"
                value={persona.domicilio_localidad}
                onChange={e => handleInputChange('domicilio_localidad', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Lanús"
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="space-y-4">
          <h4 className="border-b pb-2 font-semibold text-gray-800">📞 Contacto</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Teléfono</label>
              <input
                type="tel"
                value={persona.telefono}
                onChange={e => handleInputChange('telefono', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="11-1234-5678"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                value={persona.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errores.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ejemplo@email.com"
                disabled={disabled}
              />
              {errores.email && <p className="mt-1 text-xs text-red-500">{errores.email}</p>}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 border-t pt-6">
          {onCancelar && (
            <Button type="button" variant="outline" onClick={onCancelar} disabled={disabled}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={disabled}>
            <Save className="mr-2 h-4 w-4" />
            Guardar {rol.toLowerCase()}
          </Button>
        </div>
      </form>
    </div>
  )
}
