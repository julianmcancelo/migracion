'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Upload, X, Eye, Settings, Palette, Image as ImageIcon } from 'lucide-react'

interface ConfiguracionApp {
  id: number
  titulo: string
  subtitulo?: string | null
  logo_base64?: string | null
  favicon_base64?: string | null
  color_primario?: string | null
  color_secundario?: string | null
  pie_pagina?: string | null
  actualizado_en: string
}

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<ConfiguracionApp | null>(null)
  const [previewLogo, setPreviewLogo] = useState(false)

  // Estados del formulario
  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')
  const [logoBase64, setLogoBase64] = useState('')
  const [faviconBase64, setFaviconBase64] = useState('')
  const [colorPrimario, setColorPrimario] = useState('#2563eb')
  const [colorSecundario, setColorSecundario] = useState('#1e40af')
  const [piePagina, setPiePagina] = useState('')

  useEffect(() => {
    cargarConfiguracion()
  }, [])

  const cargarConfiguracion = async () => {
    try {
      const response = await fetch('/api/configuracion')
      const data = await response.json()

      if (data.success) {
        setConfig(data.data)
        setTitulo(data.data.titulo || '')
        setSubtitulo(data.data.subtitulo || '')
        setLogoBase64(data.data.logo_base64 || '')
        setFaviconBase64(data.data.favicon_base64 || '')
        setColorPrimario(data.data.color_primario || '#2563eb')
        setColorSecundario(data.data.color_secundario || '#1e40af')
        setPiePagina(data.data.pie_pagina || '')
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error)
      toast.error('Error al cargar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (file: File, setBase64: (value: string) => void) => {
    if (!file) return

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar 2MB')
      return
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setBase64(base64)
      toast.success('Imagen cargada correctamente')
    }
    reader.onerror = () => {
      toast.error('Error al leer la imagen')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          subtitulo: subtitulo || null,
          logo_base64: logoBase64 || null,
          favicon_base64: faviconBase64 || null,
          color_primario: colorPrimario,
          color_secundario: colorSecundario,
          pie_pagina: piePagina || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Configuración actualizada correctamente')
        cargarConfiguracion()
        
        // Recargar la página para aplicar cambios
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast.error(data.error || 'Error al guardar')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Configuración de la Aplicación</h1>
        </div>
        <p className="text-gray-600">Personaliza el título, logo y colores de la aplicación</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Información General
            </CardTitle>
            <CardDescription>Título y subtítulo de la aplicación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="titulo">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Sistema de Gestión Municipal"
                required
                maxLength={200}
              />
              <p className="text-sm text-gray-500 mt-1">Aparece en el header y login</p>
            </div>

            <div>
              <Label htmlFor="subtitulo">Subtítulo</Label>
              <Input
                id="subtitulo"
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
                placeholder="Municipio de Lanús"
                maxLength={300}
              />
              <p className="text-sm text-gray-500 mt-1">Texto secundario bajo el título</p>
            </div>

            <div>
              <Label htmlFor="pie_pagina">Pie de Página</Label>
              <Textarea
                id="pie_pagina"
                value={piePagina}
                onChange={(e) => setPiePagina(e.target.value)}
                placeholder="© 2025 Municipio de Lanús. Todos los derechos reservados."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Logo y Favicon
            </CardTitle>
            <CardDescription>Imágenes de identidad de la aplicación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Principal */}
            <div>
              <Label>Logo Principal</Label>
              <div className="mt-2 flex items-start gap-4">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, setLogoBase64)
                    }}
                    className="mb-2"
                  />
                  <p className="text-sm text-gray-500">
                    Formatos: PNG, JPG, SVG. Tamaño máximo: 2MB. Recomendado: fondo transparente.
                  </p>
                </div>

                {logoBase64 && (
                  <div className="flex flex-col gap-2">
                    <div className="relative group">
                      <img
                        src={logoBase64}
                        alt="Logo preview"
                        className="h-16 w-auto border rounded-lg shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setLogoBase64('')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewLogo(!previewLogo)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {previewLogo ? 'Ocultar' : 'Vista previa'}
                    </Button>
                  </div>
                )}
              </div>

              {previewLogo && logoBase64 && (
                <div className="mt-4 p-6 border-2 border-dashed rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600 mb-3 font-medium">Vista previa en header:</p>
                  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-3">
                    <img src={logoBase64} alt="Logo" className="h-12 w-auto" />
                    <div>
                      <p className="font-bold text-lg">{titulo}</p>
                      {subtitulo && <p className="text-sm text-gray-600">{subtitulo}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Favicon */}
            <div>
              <Label>Favicon (icono del navegador)</Label>
              <div className="mt-2 flex items-start gap-4">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, setFaviconBase64)
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Tamaño recomendado: 32x32px o 64x64px
                  </p>
                </div>

                {faviconBase64 && (
                  <div className="relative group">
                    <img
                      src={faviconBase64}
                      alt="Favicon preview"
                      className="h-8 w-8 border rounded shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setFaviconBase64('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Colores del Tema
            </CardTitle>
            <CardDescription>Personaliza los colores principales de la interfaz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color_primario">Color Primario</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="color_primario"
                    type="color"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    placeholder="#2563eb"
                    maxLength={20}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Botones, enlaces, elementos principales</p>
              </div>

              <div>
                <Label htmlFor="color_secundario">Color Secundario</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="color_secundario"
                    type="color"
                    value={colorSecundario}
                    onChange={(e) => setColorSecundario(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={colorSecundario}
                    onChange={(e) => setColorSecundario(e.target.value)}
                    placeholder="#1e40af"
                    maxLength={20}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Hover, estados activos</p>
              </div>
            </div>

            {/* Vista previa de colores */}
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">Vista previa:</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  style={{ backgroundColor: colorPrimario }}
                  className="px-4 py-2 text-white rounded-lg font-medium"
                >
                  Botón Primario
                </button>
                <button
                  type="button"
                  style={{ backgroundColor: colorSecundario }}
                  className="px-4 py-2 text-white rounded-lg font-medium"
                >
                  Botón Secundario
                </button>
                <div
                  style={{ borderColor: colorPrimario, color: colorPrimario }}
                  className="px-4 py-2 border-2 rounded-lg font-medium"
                >
                  Botón Outline
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-4 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => cargarConfiguracion()}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>

      {config && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Información del sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Última actualización: {new Date(config.actualizado_en).toLocaleString('es-AR')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
