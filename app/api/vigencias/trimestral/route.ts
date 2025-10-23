import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface VigenciaTrimestral {
  anio: number
  trimestre: number
  total: number
  escolares: number
  remis: number
  activas: number
  vencidas: number
  habilitaciones: Array<{
    id: number
    nro_licencia: string | null
    tipo_transporte: string | null
    vigencia_inicio: Date | null
    vigencia_fin: Date | null
    estado: string | null
    titular: string
    dni: string | null
    dominio: string | null
  }>
}

function obtenerTrimestre(fecha: Date): number {
  const mes = fecha.getMonth() + 1
  if (mes <= 3) return 1
  if (mes <= 6) return 2
  if (mes <= 9) return 3
  return 4
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const anioParam = searchParams.get('anio')
    const trimestreParam = searchParams.get('trimestre')

    // Obtener todas las habilitaciones con vigencia
    const habilitaciones = await prisma.habilitaciones_generales.findMany({
      where: {
        vigencia_inicio: {
          not: null,
        },
      },
      select: {
        id: true,
        nro_licencia: true,
        tipo_transporte: true,
        vigencia_inicio: true,
        vigencia_fin: true,
        estado: true,
        persona: {
          select: {
            apellido: true,
            nombre: true,
            dni: true,
          },
        },
        vehiculo: {
          select: {
            dominio: true,
            marca: true,
            modelo: true,
          },
        },
      },
      orderBy: {
        vigencia_inicio: 'desc',
      },
    })

    // Agrupar por trimestre
    const porTrimestre = new Map<string, VigenciaTrimestral>()

    habilitaciones.forEach((hab) => {
      if (!hab.vigencia_inicio) return

      const fecha = new Date(hab.vigencia_inicio)
      const anio = fecha.getFullYear()
      const trimestre = obtenerTrimestre(fecha)

      // Aplicar filtros
      if (anioParam && anio !== parseInt(anioParam)) return
      if (trimestreParam && trimestre !== parseInt(trimestreParam)) return

      const clave = `${anio}-Q${trimestre}`

      if (!porTrimestre.has(clave)) {
        porTrimestre.set(clave, {
          anio,
          trimestre,
          total: 0,
          escolares: 0,
          remis: 0,
          activas: 0,
          vencidas: 0,
          habilitaciones: [],
        })
      }

      const datos = porTrimestre.get(clave)!

      // Incrementar contadores
      datos.total++
      if (hab.tipo_transporte === 'escolar') datos.escolares++
      if (hab.tipo_transporte === 'remis') datos.remis++
      if (hab.estado === 'activo') datos.activas++
      if (hab.estado === 'vencida') datos.vencidas++

      // Agregar habilitación
      datos.habilitaciones.push({
        id: hab.id,
        nro_licencia: hab.nro_licencia,
        tipo_transporte: hab.tipo_transporte,
        vigencia_inicio: hab.vigencia_inicio,
        vigencia_fin: hab.vigencia_fin,
        estado: hab.estado,
        titular: hab.persona
          ? `${hab.persona.apellido || ''} ${hab.persona.nombre || ''}`.trim()
          : 'Sin titular',
        dni: hab.persona?.dni || null,
        dominio: hab.vehiculo?.dominio || null,
      })
    })

    // Convertir a array y ordenar
    const trimestres = Array.from(porTrimestre.entries())
      .map(([clave, datos]) => ({
        clave,
        ...datos,
      }))
      .sort((a, b) => {
        if (a.anio !== b.anio) return b.anio - a.anio
        return b.trimestre - a.trimestre
      })

    return NextResponse.json({
      success: true,
      trimestres,
      total: trimestres.reduce((sum, t) => sum + t.total, 0),
    })
  } catch (error) {
    console.error('Error obteniendo vigencias trimestrales:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo datos' },
      { status: 500 }
    )
  }
}
