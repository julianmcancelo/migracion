/**
 * 🔒 UTILIDADES DE SEGURIDAD
 * Funciones centralizadas para validación, sanitización y seguridad
 */

import { z } from 'zod'

/**
 * Validación de archivos subidos
 */
export interface FileValidationOptions {
  maxSize?: number // bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
}

export async function validateFileUpload(
  file: File,
  options: FileValidationOptions = {}
): Promise<{ valid: boolean; error?: string; safeName?: string }> {
  const maxSize = options.maxSize || 10 * 1024 * 1024 // 10MB default
  const allowedTypes = options.allowedTypes || [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
  ]
  const allowedExtensions = options.allowedExtensions || ['jpg', 'jpeg', 'png', 'pdf']

  // Validar que existe el archivo
  if (!file) {
    return { valid: false, error: 'No se proporcionó archivo' }
  }

  // Validar tamaño
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Archivo muy grande. Máximo: ${maxSize / 1024 / 1024}MB`,
    }
  }

  // Validar tamaño mínimo (evitar archivos vacíos)
  if (file.size < 100) {
    return { valid: false, error: 'Archivo muy pequeño o vacío' }
  }

  // Validar tipo MIME
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido: ${file.type}. Permitidos: ${allowedTypes.join(', ')}`,
    }
  }

  // Validar extensión
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Extensión no permitida: ${extension}. Permitidas: ${allowedExtensions.join(', ')}`,
    }
  }

  // Sanitizar nombre de archivo
  const safeName = sanitizeFileName(file.name)

  return { valid: true, safeName }
}

/**
 * Sanitizar nombre de archivo
 */
export function sanitizeFileName(fileName: string): string {
  return (
    fileName
      // Eliminar caracteres peligrosos
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      // Eliminar múltiples puntos consecutivos
      .replace(/\.{2,}/g, '.')
      // Limitar longitud
      .substring(0, 255)
      // Eliminar espacios al inicio y final
      .trim()
  )
}

/**
 * Sanitizar string para prevenir XSS
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  return (
    input
      // Eliminar caracteres de control
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Eliminar scripts
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Limitar longitud
      .substring(0, maxLength)
      .trim()
  )
}

/**
 * Validar y sanitizar email
 */
export function validateEmail(email: string): { valid: boolean; email?: string; error?: string } {
  const emailSchema = z.string().email().max(255)
  const result = emailSchema.safeParse(email.toLowerCase().trim())

  if (!result.success) {
    return { valid: false, error: 'Email inválido' }
  }

  return { valid: true, email: result.data }
}

/**
 * Validar DNI argentino
 */
export function validateDNI(dni: string): { valid: boolean; dni?: string; error?: string } {
  // Eliminar puntos y espacios
  const cleanDNI = dni.replace(/[.\s]/g, '')

  // Validar que solo contenga números
  if (!/^\d+$/.test(cleanDNI)) {
    return { valid: false, error: 'DNI debe contener solo números' }
  }

  // Validar longitud (7-8 dígitos)
  if (cleanDNI.length < 7 || cleanDNI.length > 8) {
    return { valid: false, error: 'DNI debe tener 7 u 8 dígitos' }
  }

  return { valid: true, dni: cleanDNI }
}

/**
 * Validar CUIL/CUIT argentino
 */
export function validateCUIL(cuil: string): { valid: boolean; cuil?: string; error?: string } {
  // Eliminar guiones y espacios
  const cleanCUIL = cuil.replace(/[-\s]/g, '')

  // Validar que solo contenga números
  if (!/^\d{11}$/.test(cleanCUIL)) {
    return { valid: false, error: 'CUIL/CUIT debe tener 11 dígitos' }
  }

  // Validar dígito verificador
  const [checkDigit, ...rest] = cleanCUIL.split('').map(Number).reverse()
  const total = rest.reduce((acc, digit, index) => {
    const multiplier = 2 + (index % 6)
    return acc + digit * multiplier
  }, 0)

  const mod = 11 - (total % 11)
  const expectedCheckDigit = mod === 11 ? 0 : mod === 10 ? 9 : mod

  if (checkDigit !== expectedCheckDigit) {
    return { valid: false, error: 'CUIL/CUIT inválido (dígito verificador incorrecto)' }
  }

  return { valid: true, cuil: cleanCUIL }
}

/**
 * Validar dominio de vehículo argentino
 */
export function validateDominio(dominio: string): {
  valid: boolean
  dominio?: string
  error?: string
} {
  const cleanDominio = dominio.toUpperCase().replace(/\s/g, '')

  // Formato viejo: ABC123 (3 letras + 3 números)
  const formatoViejo = /^[A-Z]{3}\d{3}$/
  // Formato nuevo: AB123CD (2 letras + 3 números + 2 letras)
  const formatoNuevo = /^[A-Z]{2}\d{3}[A-Z]{2}$/

  if (!formatoViejo.test(cleanDominio) && !formatoNuevo.test(cleanDominio)) {
    return {
      valid: false,
      error: 'Dominio inválido. Formato: ABC123 o AB123CD',
    }
  }

  return { valid: true, dominio: cleanDominio }
}

/**
 * Rate limiting simple en memoria (para desarrollo)
 * En producción usar Redis/Upstash
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minuto
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  // Si no existe o expiró, crear nuevo
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs
    rateLimitMap.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }

  // Si ya alcanzó el límite
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  // Incrementar contador
  record.count++
  rateLimitMap.set(identifier, record)

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Limpiar rate limit map periódicamente
 */
setInterval(() => {
  const now = Date.now()
  const entries = Array.from(rateLimitMap.entries())
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60000) // Limpiar cada minuto

/**
 * Obtener IP del request
 */
export function getClientIP(request: Request): string {
  // Intentar obtener IP real de headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  return 'unknown'
}

/**
 * Verificar origen permitido (CORS)
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false

  const allowedOrigins = [
    'https://lanus.digital',
    'https://credenciales.transportelanus.com.ar',
    'http://localhost:3000', // Solo en desarrollo
  ]

  // En desarrollo, permitir localhost
  if (process.env.NODE_ENV === 'development') {
    if (origin.startsWith('http://localhost:')) return true
  }

  return allowedOrigins.includes(origin)
}

/**
 * Generar token seguro
 */
export function generateSecureToken(length: number = 32): string {
  const crypto = require('crypto')
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Hash de password (wrapper de bcrypt)
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcryptjs')
  return bcrypt.hash(password, 10)
}

/**
 * Verificar password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require('bcryptjs')
  return bcrypt.compare(password, hash)
}

/**
 * Schemas de validación comunes
 */
export const commonSchemas = {
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  dni: z.string().regex(/^\d{7,8}$/, 'DNI debe tener 7 u 8 dígitos'),
  cuil: z.string().regex(/^\d{11}$/, 'CUIL debe tener 11 dígitos'),
  dominio: z
    .string()
    .regex(/^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/, 'Dominio inválido'),
  telefono: z.string().regex(/^\d{10,15}$/, 'Teléfono inválido'),
  nombre: z.string().min(2).max(100),
  direccion: z.string().min(5).max(255),
}
