'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HabilitacionFormData } from '@/lib/validations/habilitacion'

interface DatosBasicosStepProps {
  data: Partial<HabilitacionFormData>
  onChange: (data: Partial<HabilitacionFormData>) => void
}

/**
 * Paso 1: Datos básicos de la habilitación
 */
export function DatosBasicosStep({ data, onChange }: DatosBasicosStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Información General</h3>

        {/* Tipo de Transporte */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tipo_transporte">
              Tipo de Transporte <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.tipo_transporte}
              onValueChange={value => onChange({ tipo_transporte: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Escolar">Escolar</SelectItem>
                <SelectItem value="Remis">Remis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select value={data.estado} onValueChange={value => onChange({ estado: value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INICIADO">Iniciado</SelectItem>
                <SelectItem value="EN_TRAMITE">En Trámite</SelectItem>
                <SelectItem value="HABILITADO">Habilitado</SelectItem>
                <SelectItem value="NO_HABILITADO">No Habilitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Números y Referencias */}
      <div>
        <h4 className="mb-3 font-medium">Números y Referencias</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nro_licencia">
              N° de Licencia <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nro_licencia"
              value={data.nro_licencia || ''}
              onChange={e => onChange({ nro_licencia: e.target.value })}
              placeholder="Ej: 2024-001"
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expte">
              N° de Expediente <span className="text-red-500">*</span>
            </Label>
            <Input
              id="expte"
              value={data.expte || ''}
              onChange={e => onChange({ expte: e.target.value })}
              placeholder="Ej: EXP-2024-12345"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolucion">N° de Resolución</Label>
            <Input
              id="resolucion"
              value={data.resolucion || ''}
              onChange={e => onChange({ resolucion: e.target.value })}
              placeholder="Ej: RES-2024-001"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anio">Año</Label>
            <Input
              id="anio"
              type="number"
              value={data.anio || new Date().getFullYear()}
              onChange={e => onChange({ anio: parseInt(e.target.value) })}
              min={2020}
              max={2100}
            />
          </div>
        </div>
      </div>

      {/* Vigencia */}
      <div>
        <h4 className="mb-3 font-medium">Vigencia</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vigencia_inicio">Fecha de Inicio</Label>
            <Input
              id="vigencia_inicio"
              type="date"
              value={data.vigencia_inicio || ''}
              onChange={e => onChange({ vigencia_inicio: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vigencia_fin">Fecha de Fin</Label>
            <Input
              id="vigencia_fin"
              type="date"
              value={data.vigencia_fin || ''}
              onChange={e => onChange({ vigencia_fin: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <textarea
          id="observaciones"
          className="min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={data.observaciones || ''}
          onChange={e => onChange({ observaciones: e.target.value })}
          placeholder="Notas adicionales o comentarios..."
        />
      </div>

      <div className="text-sm text-gray-500">
        <span className="text-red-500">*</span> Campos obligatorios
      </div>
    </div>
  )
}
