'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Loader2 } from 'lucide-react'
import { CrearPersonaInput } from '@/lib/validations/persona'

interface RegistrarPersonaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPersonaCreada: (persona: any) => void
  dniInicial?: string
}

/**
 * Dialog para registrar una nueva persona
 * Se muestra cuando no se encuentra la persona en la búsqueda
 */
export function RegistrarPersonaDialog({ 
  open, 
  onOpenChange, 
  onPersonaCreada,
  dniInicial = ''
}: RegistrarPersonaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<CrearPersonaInput>({
    nombre: '',
    dni: dniInicial,
    genero: 'Masculino',
    cuit: '',
    telefono: '',
    email: '',
    domicilio_calle: '',
    domicilio_nro: '',
    domicilio_localidad: 'LANUS',
  })

  const handleChange = (field: keyof CrearPersonaInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la persona')
      }

      // Notificar éxito y pasar la persona creada
      onPersonaCreada(data.data)
      
      // Resetear formulario
      setFormData({
        nombre: '',
        dni: '',
        genero: 'Masculino',
        cuit: '',
        telefono: '',
        email: '',
        domicilio_calle: '',
        domicilio_nro: '',
        domicilio_localidad: 'LANUS',
      })
      
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Registrar Nueva Persona
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Datos básicos */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nombre">
                Nombre Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ej: Juan Pérez"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">
                DNI <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dni"
                value={formData.dni}
                onChange={(e) => handleChange('dni', e.target.value)}
                placeholder="Ej: 12345678"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genero">
                Género <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.genero}
                onValueChange={(value) => handleChange('genero', value)}
                disabled={loading}
              >
                <SelectTrigger id="genero">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contacto */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Datos de Contacto</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cuit">CUIT</Label>
                <Input
                  id="cuit"
                  value={formData.cuit}
                  onChange={(e) => handleChange('cuit', e.target.value)}
                  placeholder="Ej: 20-12345678-9"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  placeholder="Ej: 1158365467"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Ej: persona@email.com"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Domicilio */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Domicilio</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="domicilio_calle">Calle</Label>
                <Input
                  id="domicilio_calle"
                  value={formData.domicilio_calle}
                  onChange={(e) => handleChange('domicilio_calle', e.target.value)}
                  placeholder="Ej: Av. Hipólito Yrigoyen"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domicilio_nro">Número</Label>
                <Input
                  id="domicilio_nro"
                  value={formData.domicilio_nro}
                  onChange={(e) => handleChange('domicilio_nro', e.target.value)}
                  placeholder="Ej: 3471"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2 sm:col-span-3">
                <Label htmlFor="domicilio_localidad">Localidad</Label>
                <Input
                  id="domicilio_localidad"
                  value={formData.domicilio_localidad}
                  onChange={(e) => handleChange('domicilio_localidad', e.target.value)}
                  placeholder="Ej: Lanús"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Registrar Persona
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
