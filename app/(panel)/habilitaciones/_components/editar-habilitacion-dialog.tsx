'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Save,
  X,
  Loader2,
  FileText,
  User,
  Car,
  Building2,
  Plus,
  Trash2,
  Search,
} from 'lucide-react'
import { useDebounce } from '@/lib/hooks/use-debounce'

interface EditarHabilitacionDialogProps {
  habilitacion: any | null
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export function EditarHabilitacionDialog({
  habilitacion,
  open,
  onClose,
  onSaved,
}: EditarHabilitacionDialogProps) {
  // Estados principales
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Datos del formulario
  const [formData, setFormData] = useState<any>({})

  // Estados para personas
  const [personas, setPersonas] = useState<any[]>([])
  const [busquedaPersona, setBusquedaPersona] = useState('')
  const [resultadosPersonas, setResultadosPersonas] = useState<any[]>([])
  const [buscandoPersonas, setBuscandoPersonas] = useState(false)

  // Estados para vehículos
  const [vehiculos, setVehiculos] = useState<any[]>([])
  const [busquedaVehiculo, setBusquedaVehiculo] = useState('')
  const [resultadosVehiculos, setResultadosVehiculos] = useState<any[]>([])
  const [buscandoVehiculos, setBuscandoVehiculos] = useState(false)

  const busquedaPersonaDebounced = useDebounce(busquedaPersona, 500)
  const busquedaVehiculoDebounced = useDebounce(busquedaVehiculo, 500)

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (open && habilitacion) {
      cargarDatos()
    }
  }, [open, habilitacion])

  // Buscar personas
  useEffect(() => {
    if (busquedaPersonaDebounced.length >= 2) {
      buscarPersonas()
    } else {
      setResultadosPersonas([])
    }
  }, [busquedaPersonaDebounced])

  // Buscar vehículos
  useEffect(() => {
    if (busquedaVehiculoDebounced.length >= 2) {
      buscarVehiculos()
    } else {
      setResultadosVehiculos([])
    }
  }, [busquedaVehiculoDebounced])

  const cargarDatos = async () => {
    if (!habilitacion?.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/habilitaciones/${habilitacion.id}`)
      const data = await response.json()

      if (data.success) {
        const hab = data.data

        // Formatear fechas para inputs de tipo date
        const vigenciaInicio = hab.vigencia_inicio
          ? new Date(hab.vigencia_inicio).toISOString().split('T')[0]
          : ''
        const vigenciaFin = hab.vigencia_fin
          ? new Date(hab.vigencia_fin).toISOString().split('T')[0]
          : ''

        setFormData({
          tipo_transporte: hab.tipo_transporte || 'Escolar',
          estado: hab.estado || 'EN_TRAMITE',
          nro_licencia: hab.nro_licencia || '',
          expte: hab.expte || '',
          resolucion: hab.resolucion || '',
          anio: hab.anio || new Date().getFullYear(),
          vigencia_inicio: vigenciaInicio,
          vigencia_fin: vigenciaFin,
          observaciones: hab.observaciones || '',
          oblea_colocada: hab.oblea_colocada || false,
        })

        // Cargar personas
        setPersonas(
          hab.habilitaciones_personas?.map((hp: any) => ({
            id: hp.id,
            persona_id: hp.persona?.id,
            nombre: hp.persona?.nombre,
            dni: hp.persona?.dni,
            rol: hp.rol,
            licencia_categoria: hp.licencia_categoria,
          })) || []
        )

        // Cargar vehículos
        setVehiculos(
          hab.habilitaciones_vehiculos?.map((hv: any) => ({
            id: hv.id,
            vehiculo_id: hv.vehiculo?.id,
            dominio: hv.vehiculo?.dominio,
            marca: hv.vehiculo?.marca,
            modelo: hv.vehiculo?.modelo,
          })) || []
        )
      }
    } catch (err) {
      console.error('Error al cargar habilitación:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const buscarPersonas = async () => {
    setBuscandoPersonas(true)
    try {
      const response = await fetch(
        `/api/personas?buscar=${encodeURIComponent(busquedaPersonaDebounced)}`
      )
      const data = await response.json()
      if (data.success) {
        setResultadosPersonas(data.data)
      }
    } catch (err) {
      console.error('Error al buscar personas:', err)
    } finally {
      setBuscandoPersonas(false)
    }
  }

  const buscarVehiculos = async () => {
    setBuscandoVehiculos(true)
    try {
      const response = await fetch(
        `/api/vehiculos?buscar=${encodeURIComponent(busquedaVehiculoDebounced)}`
      )
      const data = await response.json()
      if (data.success) {
        setResultadosVehiculos(data.data)
      }
    } catch (err) {
      console.error('Error al buscar vehículos:', err)
    } finally {
      setBuscandoVehiculos(false)
    }
  }

  const agregarPersona = (persona: any, rol: string = 'CONDUCTOR') => {
    if (personas.some(p => p.persona_id === persona.id)) {
      alert('Esta persona ya está agregada')
      return
    }

    setPersonas([
      ...personas,
      {
        persona_id: persona.id,
        nombre: persona.nombre,
        dni: persona.dni,
        rol,
        licencia_categoria: '',
        _nuevo: true,
      },
    ])
    setBusquedaPersona('')
    setResultadosPersonas([])
  }

  const eliminarPersona = (index: number) => {
    setPersonas(personas.filter((_, i) => i !== index))
  }

  const agregarVehiculo = (vehiculo: any) => {
    if (vehiculos.some(v => v.vehiculo_id === vehiculo.id)) {
      alert('Este vehículo ya está agregado')
      return
    }

    setVehiculos([
      ...vehiculos,
      {
        vehiculo_id: vehiculo.id,
        dominio: vehiculo.dominio,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        _nuevo: true,
      },
    ])
    setBusquedaVehiculo('')
    setResultadosVehiculos([])
  }

  const eliminarVehiculo = (index: number) => {
    setVehiculos(vehiculos.filter((_, i) => i !== index))
  }

  const handleGuardar = async () => {
    if (!habilitacion?.id) return

    setSaving(true)
    setError(null)

    try {
      const payload = {
        ...formData,
        personas: personas.map(p => ({
          id: p._nuevo ? undefined : p.id,
          persona_id: p.persona_id,
          rol: p.rol,
          licencia_categoria: p.licencia_categoria || null,
        })),
        vehiculos: vehiculos.map(v => ({
          id: v._nuevo ? undefined : v.id,
          vehiculo_id: v.vehiculo_id,
        })),
      }

      const response = await fetch(`/api/habilitaciones/${habilitacion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar')
      }

      onSaved?.()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!habilitacion) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] max-w-5xl overflow-hidden p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-6 w-6" />
              Editar Habilitación N° {habilitacion.nro_licencia}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(95vh - 180px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Tabs defaultValue="basicos" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basicos">
                  <FileText className="mr-2 h-4 w-4" />
                  Datos Básicos
                </TabsTrigger>
                <TabsTrigger value="personas">
                  <User className="mr-2 h-4 w-4" />
                  Personas ({personas.length})
                </TabsTrigger>
                <TabsTrigger value="vehiculos">
                  <Car className="mr-2 h-4 w-4" />
                  Vehículos ({vehiculos.length})
                </TabsTrigger>
              </TabsList>

              {/* Tab: Datos Básicos */}
              <TabsContent value="basicos" className="mt-6 space-y-6">
                {error && (
                  <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tipo de Transporte *</Label>
                    <Select
                      value={formData.tipo_transporte}
                      onValueChange={value => setFormData({ ...formData, tipo_transporte: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Escolar">Escolar</SelectItem>
                        <SelectItem value="Remis">Remis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Estado *</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={value => setFormData({ ...formData, estado: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INICIADO">Iniciado</SelectItem>
                        <SelectItem value="EN_TRAMITE">En Trámite</SelectItem>
                        <SelectItem value="HABILITADO">Habilitado</SelectItem>
                        <SelectItem value="NO_HABILITADO">No Habilitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>N° de Licencia *</Label>
                    <Input
                      value={formData.nro_licencia}
                      onChange={e => setFormData({ ...formData, nro_licencia: e.target.value })}
                      placeholder="Ej: 868-0055"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>N° de Expediente *</Label>
                    <Input
                      value={formData.expte}
                      onChange={e => setFormData({ ...formData, expte: e.target.value })}
                      placeholder="Ej: EXP-2024-001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>N° de Resolución</Label>
                    <Input
                      value={formData.resolucion}
                      onChange={e => setFormData({ ...formData, resolucion: e.target.value })}
                      placeholder="Ej: RES-2024-001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Año</Label>
                    <Input
                      type="number"
                      value={formData.anio}
                      onChange={e => setFormData({ ...formData, anio: parseInt(e.target.value) })}
                      min={2020}
                      max={2100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Vigencia Inicio</Label>
                    <Input
                      type="date"
                      value={formData.vigencia_inicio}
                      onChange={e => setFormData({ ...formData, vigencia_inicio: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Vigencia Fin</Label>
                    <Input
                      type="date"
                      value={formData.vigencia_fin}
                      onChange={e => setFormData({ ...formData, vigencia_fin: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label>Observaciones</Label>
                    <textarea
                      className="min-h-[100px] w-full rounded-md border px-3 py-2 text-sm"
                      value={formData.observaciones}
                      onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                      placeholder="Notas adicionales..."
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.oblea_colocada}
                        onChange={e =>
                          setFormData({ ...formData, oblea_colocada: e.target.checked })
                        }
                        className="h-4 w-4"
                      />
                      <Label>Oblea Colocada</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Personas */}
              <TabsContent value="personas" className="mt-6 space-y-6">
                {/* Buscar persona */}
                <div className="rounded-lg border bg-gray-50 p-4">
                  <Label className="mb-2">Agregar Persona</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      className="pl-9"
                      value={busquedaPersona}
                      onChange={e => setBusquedaPersona(e.target.value)}
                      placeholder="Buscar por nombre o DNI..."
                    />
                  </div>

                  {/* Resultados búsqueda */}
                  {busquedaPersona.length >= 2 && (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-md border bg-white">
                      {buscandoPersonas ? (
                        <div className="p-4 text-center text-sm text-gray-500">Buscando...</div>
                      ) : resultadosPersonas.length > 0 ? (
                        resultadosPersonas.map(persona => (
                          <div
                            key={persona.id}
                            className="flex cursor-pointer items-center justify-between p-3 hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-medium">{persona.nombre}</p>
                              <p className="text-xs text-gray-500">DNI: {persona.dni}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => agregarPersona(persona)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No se encontraron personas
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Lista de personas */}
                <div className="space-y-3">
                  <h4 className="font-medium">Personas Asociadas ({personas.length})</h4>
                  {personas.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed py-8 text-center text-gray-500">
                      No hay personas asociadas
                    </div>
                  ) : (
                    personas.map((persona, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between rounded-lg border bg-gray-50 p-4"
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <p className="font-bold">{persona.nombre}</p>
                            <Badge variant={persona._nuevo ? 'default' : 'secondary'}>
                              {persona._nuevo ? 'Nuevo' : persona.rol}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">DNI: {persona.dni}</p>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Rol</Label>
                              <Select
                                value={persona.rol}
                                onValueChange={value => {
                                  const newPersonas = [...personas]
                                  newPersonas[index].rol = value
                                  setPersonas(newPersonas)
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="TITULAR">Titular</SelectItem>
                                  <SelectItem value="CONDUCTOR">Conductor</SelectItem>
                                  <SelectItem value="CHOFER">Chofer</SelectItem>
                                  <SelectItem value="CELADOR">Celador</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Licencia</Label>
                              <Input
                                className="h-8 text-xs"
                                value={persona.licencia_categoria || ''}
                                onChange={e => {
                                  const newPersonas = [...personas]
                                  newPersonas[index].licencia_categoria = e.target.value
                                  setPersonas(newPersonas)
                                }}
                                placeholder="Ej: D1"
                              />
                            </div>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => eliminarPersona(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Tab: Vehículos */}
              <TabsContent value="vehiculos" className="mt-6 space-y-6">
                {/* Buscar vehículo */}
                <div className="rounded-lg border bg-gray-50 p-4">
                  <Label className="mb-2">Agregar Vehículo</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      className="pl-9"
                      value={busquedaVehiculo}
                      onChange={e => setBusquedaVehiculo(e.target.value)}
                      placeholder="Buscar por dominio..."
                    />
                  </div>

                  {/* Resultados búsqueda */}
                  {busquedaVehiculo.length >= 2 && (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-md border bg-white">
                      {buscandoVehiculos ? (
                        <div className="p-4 text-center text-sm text-gray-500">Buscando...</div>
                      ) : resultadosVehiculos.length > 0 ? (
                        resultadosVehiculos.map(vehiculo => (
                          <div
                            key={vehiculo.id}
                            className="flex cursor-pointer items-center justify-between p-3 hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-bold">{vehiculo.dominio}</p>
                              <p className="text-xs text-gray-500">
                                {vehiculo.marca} {vehiculo.modelo}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => agregarVehiculo(vehiculo)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No se encontraron vehículos
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Lista de vehículos */}
                <div className="space-y-3">
                  <h4 className="font-medium">Vehículos Asociados ({vehiculos.length})</h4>
                  {vehiculos.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed py-8 text-center text-gray-500">
                      No hay vehículos asociados
                    </div>
                  ) : (
                    vehiculos.map((vehiculo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border bg-gray-50 p-4"
                      >
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <p className="text-lg font-bold">{vehiculo.dominio}</p>
                            {vehiculo._nuevo && <Badge variant="default">Nuevo</Badge>}
                          </div>
                          <p className="text-sm text-gray-600">
                            {vehiculo.marca} {vehiculo.modelo}
                          </p>
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => eliminarVehiculo(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white p-6">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
