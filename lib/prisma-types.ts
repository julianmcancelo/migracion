import { Prisma } from '@prisma/client'

/**
 * Tipos extendidos de Prisma para evitar 'any'
 *
 * Estos tipos proporcionan type-safety completo al trabajar
 * con queries que incluyen relaciones.
 */

// ============================================
// HABILITACIONES CON RELACIONES
// ============================================

export type HabilitacionConRelaciones = Prisma.habilitaciones_generalesGetPayload<{
  include: {
    habilitaciones_personas: {
      include: { persona: true }
    }
    habilitaciones_vehiculos: {
      include: { vehiculo: true }
    }
    habilitaciones_establecimientos: true
    habilitaciones_documentos: true
  }
}>

export type HabilitacionBasica = Prisma.habilitaciones_generalesGetPayload<{
  select: {
    id: true
    nro_licencia: true
    estado: true
    tipo_transporte: true
    vigencia_inicio: true
    vigencia_fin: true
  }
}>

export type HabilitacionConTitular = Prisma.habilitaciones_generalesGetPayload<{
  include: {
    habilitaciones_personas: {
      where: { rol: 'TITULAR' }
      take: 1
      include: { persona: true }
    }
  }
}>

// ============================================
// PERSONAS CON RELACIONES
// ============================================

export type PersonaConHabilitaciones = Prisma.personasGetPayload<{
  include: {
    habilitaciones_personas: {
      include: {
        habilitacion: true
      }
    }
  }
}>

export type PersonaBasica = Prisma.personasGetPayload<{
  select: {
    id: true
    nombre: true
    dni: true
    email: true
    telefono: true
  }
}>

// ============================================
// VEHÍCULOS CON RELACIONES
// ============================================

export type VehiculoConHabilitaciones = Prisma.vehiculosGetPayload<{
  include: {
    habilitaciones_vehiculos: {
      include: {
        habilitacion: true
      }
    }
  }
}>

export type VehiculoBasico = Prisma.vehiculosGetPayload<{
  select: {
    id: true
    dominio: true
    marca: true
    modelo: true
    tipo: true
    ano: true
  }
}>

// ============================================
// INSPECCIONES CON RELACIONES
// ============================================

export type InspeccionCompleta = Prisma.inspeccionesGetPayload<{
  include: {
    inspeccion_detalles: true
    inspeccion_fotos: true
    inspeccion_items: true
  }
}>

export type InspeccionBasica = Prisma.inspeccionesGetPayload<{
  select: {
    id: true
    nro_licencia: true
    nombre_inspector: true
    fecha_inspeccion: true
    resultado: true
  }
}>

// ============================================
// TURNOS CON RELACIONES
// ============================================

export type TurnoConHabilitacion = Prisma.turnosGetPayload<{
  include: {
    habilitacion: {
      include: {
        habilitaciones_personas: {
          where: { rol: 'TITULAR' }
          include: { persona: true }
        }
      }
    }
  }
}>

// ============================================
// OBLEAS CON RELACIONES
// ============================================

export type ObleaCompleta = Prisma.obleasGetPayload<{
  include: {
    habilitaciones_generales: {
      include: {
        habilitaciones_personas: {
          include: { persona: true }
        }
        habilitaciones_vehiculos: {
          include: { vehiculo: true }
        }
      }
    }
  }
}>

// ============================================
// TIPOS DE RESPUESTA FORMATEADOS
// ============================================

/**
 * Formato de habilitación para listados
 */
export interface HabilitacionFormateada {
  id: number
  nro_licencia: string | null
  resolucion: string | null
  estado: string | null
  vigencia_inicio: Date | null
  vigencia_fin: Date | null
  tipo_transporte: string | null
  expte: string | null
  observaciones: string | null
  titular_principal: string | null
  personas: PersonaEnHabilitacion[]
  vehiculos: VehiculoEnHabilitacion[]
  establecimientos: EstablecimientoEnHabilitacion[]
  tiene_resolucion: boolean
  resolucion_doc_id: number | null
}

export interface PersonaEnHabilitacion {
  id: number
  nombre: string | null
  dni: string
  rol: string | null
  licencia_categoria: string | null
}

export interface VehiculoEnHabilitacion {
  id: number
  dominio: string | null
  marca: string | null
  modelo: string | null
  tipo: string | null
}

export interface EstablecimientoEnHabilitacion {
  id: number
  nombre: string
  tipo: string | null
}

// ============================================
// HELPERS DE PAGINACIÓN
// ============================================

export interface PaginationParams {
  pagina: number
  limite: number
}

export interface PaginationMeta {
  pagina_actual: number
  limite: number
  total: number
  total_paginas: number
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: PaginationMeta
}

// ============================================
// FILTROS Y BÚSQUEDA
// ============================================

export interface HabilitacionesFilter {
  tipo?: 'Escolar' | 'Remis' | 'Demo'
  buscar?: string
  estado?: string
  pagina?: number
  limite?: number
  ordenar?: 'id_desc' | 'licencia_asc' | 'licencia_desc'
}

export interface PersonasFilter {
  buscar?: string
  limite?: number
}

export interface VehiculosFilter {
  buscar?: string
  limite?: number
}
