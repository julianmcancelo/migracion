import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind CSS de forma inteligente
 * - Merge de clases conflictivas
 * - Soporte para condicionales
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha en español
 */
export function formatearFecha(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formatea un número como moneda argentina
 */
export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(monto)
}

/**
 * Obtiene las iniciales de un nombre
 */
export function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Sanitiza un string para HTML
 */
export function sanitizar(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return str.replace(/[&<>"']/g, m => map[m])
}
