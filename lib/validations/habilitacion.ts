import { z } from 'zod'

/**
 * Schema de validación para crear/editar habilitaciones
 */

// Schema para persona vinculada
export const personaHabilitacionSchema = z.object({
  persona_id: z.number().positive('Debe seleccionar una persona'),
  rol: z.enum(['TITULAR', 'CONDUCTOR', 'CHOFER', 'CELADOR'], {
    required_error: 'El rol es requerido',
  }),
  licencia_categoria: z.string().optional(),
})

// Schema para vehículo vinculado
export const vehiculoHabilitacionSchema = z.object({
  vehiculo_id: z.number().positive('Debe seleccionar un vehículo'),
})

// Schema para establecimiento vinculado
export const establecimientoHabilitacionSchema = z.object({
  establecimiento_id: z.number().positive('Debe seleccionar un establecimiento'),
  tipo: z.enum(['establecimiento', 'remiseria']).default('establecimiento'),
})

// Schema principal de habilitación
export const habilitacionSchema = z.object({
  // Datos básicos
  tipo_transporte: z.enum(['Escolar', 'Remis', 'Demo'], {
    required_error: 'El tipo de transporte es requerido',
  }),
  estado: z.enum(['HABILITADO', 'NO_HABILITADO', 'EN_TRAMITE', 'INICIADO']).default('INICIADO'),

  // Fechas
  anio: z.number().int().min(2020).max(2100).optional(),
  vigencia_inicio: z.string().optional(), // ISO date string
  vigencia_fin: z.string().optional(),

  // Números y referencias
  nro_licencia: z.string().min(1, 'El número de licencia es requerido').max(20),
  expte: z.string().min(1, 'El número de expediente es requerido').max(50),
  resolucion: z.string().max(50).optional(),

  // Otros datos
  observaciones: z.string().optional(),
  oblea_colocada: z.boolean().default(false),

  // Relaciones
  personas: z.array(personaHabilitacionSchema).min(1, 'Debe agregar al menos una persona'),
  vehiculos: z.array(vehiculoHabilitacionSchema).min(1, 'Debe agregar al menos un vehículo'),
  establecimientos: z.array(establecimientoHabilitacionSchema).optional(),
})

// Tipos TypeScript inferidos
export type HabilitacionFormData = z.infer<typeof habilitacionSchema>
export type PersonaHabilitacion = z.infer<typeof personaHabilitacionSchema>
export type VehiculoHabilitacion = z.infer<typeof vehiculoHabilitacionSchema>
export type EstablecimientoHabilitacion = z.infer<typeof establecimientoHabilitacionSchema>

// Schema para búsqueda de personas (para el selector)
export const buscarPersonaSchema = z.object({
  buscar: z.string().min(2, 'Ingrese al menos 2 caracteres'),
})

// Schema para búsqueda de vehículos
export const buscarVehiculoSchema = z.object({
  buscar: z.string().min(2, 'Ingrese al menos 2 caracteres'),
})

// Schema para búsqueda de establecimientos
export const buscarEstablecimientoSchema = z.object({
  buscar: z.string().min(2, 'Ingrese al menos 2 caracteres'),
  tipo: z.enum(['establecimiento', 'remiseria']).optional(),
})
