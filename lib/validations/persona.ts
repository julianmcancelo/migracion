import { z } from 'zod'

/**
 * Schema de validación para crear una nueva persona
 */
export const crearPersonaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  dni: z.string().min(7, 'DNI inválido').max(20, 'DNI inválido'),
  genero: z.enum(['Masculino', 'Femenino', 'Otro'], {
    errorMap: () => ({ message: 'Seleccione un género' }),
  }),
  cuit: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  domicilio_calle: z.string().optional(),
  domicilio_nro: z.string().optional(),
  domicilio_localidad: z.string().optional(),
})

export type CrearPersonaInput = z.infer<typeof crearPersonaSchema>
