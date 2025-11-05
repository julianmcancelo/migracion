// Tipos para el sistema de paradas

export type ParadaTipo = 'seguridad' | 'transporte' | 'semaforo' | 'salud' | 'educacion' | 'municipal'
export type ParadaEstado = 'ok' | 'falla' | 'mantenimiento'

export interface ParadaImagen {
  id: number
  parada_id: number
  imagen_base64: string
  descripcion?: string | null
  orden: number
  creado_en: Date | string
}

export interface Parada {
  id: number
  titulo: string
  tipo: ParadaTipo
  descripcion?: string | null
  latitud: number
  longitud: number
  estado?: ParadaEstado | null
  activo: boolean
  creado_en: Date | string
  actualizado: Date | string
  creado_por?: number | null
  metadata?: any
  imagenes?: ParadaImagen[]
}

export interface ParadaFormData {
  titulo: string
  tipo: ParadaTipo
  descripcion?: string
  latitud: number
  longitud: number
  estado?: ParadaEstado
  metadata?: any
  imagenes?: Array<{
    imagen_base64: string
    descripcion?: string
    orden?: number
  }>
}

export const TIPOS_PARADA = {
  seguridad: {
    label: 'Punto de Seguridad',
    icon: 'shield-halved',
    color: '#2563eb', // blue-600
  },
  transporte: {
    label: 'Garita / Transporte',
    icon: 'bus',
    color: '#eab308', // yellow-500
  },
  semaforo: {
    label: 'Semáforo',
    icon: 'traffic-light',
    color: '#4b5563', // gray-700
  },
  salud: {
    label: 'Centro de Salud',
    icon: 'briefcase-medical',
    color: '#dc2626', // red-600
  },
  educacion: {
    label: 'Escuela / Educación',
    icon: 'graduation-cap',
    color: '#16a34a', // green-600
  },
  municipal: {
    label: 'Oficina Municipal',
    icon: 'building-columns',
    color: '#4b5563', // gray-700
  },
} as const
