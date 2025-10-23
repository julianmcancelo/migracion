import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/habilitaciones/debug
 * Ruta de debugging para diagnosticar problemas
 */
export async function GET() {
  try {
    // Debug route - permite acceso sin autenticación para diagnóstico
    const session = await getSession()
    const isAuthenticated = !!session

    // Test 1: Conexión básica
    const count = await prisma.habilitaciones_generales.count()

    // Test 2: Una habilitación sin relaciones
    const simple = await prisma.habilitaciones_generales.findFirst({
      take: 1,
    })

    // Test 3: Con relación a personas
    let withPersonas = null
    try {
      withPersonas = await prisma.habilitaciones_generales.findFirst({
        take: 1,
        include: {
          habilitaciones_personas: true,
        },
      } as any)
    } catch (e: any) {
      withPersonas = { error: e.message }
    }

    // Test 4: Con todas las relaciones
    let withAll = null
    try {
      withAll = await prisma.habilitaciones_generales.findFirst({
        take: 1,
        include: {
          habilitaciones_personas: {
            include: {
              persona: true,
            },
          },
          habilitaciones_vehiculos: {
            include: {
              vehiculo: true,
            },
          },
          habilitaciones_establecimientos: true,
        },
      } as any)
    } catch (e: any) {
      withAll = { error: e.message }
    }

    return NextResponse.json({
      success: true,
      environment: {
        isAuthenticated,
        user: session?.nombre || 'Anonymous',
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
      tests: {
        count,
        simple: simple ? 'OK' : 'No data',
        withPersonas: (withPersonas as any)?.error || 'OK',
        withAll: (withAll as any)?.error || 'OK',
      },
      sample: {
        simple: simple
          ? {
              id: simple.id,
              nro_licencia: simple.nro_licencia,
            }
          : null,
        withAll:
          withAll && !(withAll as any).error
            ? {
                id: (withAll as any).id,
                personas: (withAll as any).habilitaciones_personas?.length || 0,
                vehiculos: (withAll as any).habilitaciones_vehiculos?.length || 0,
                establecimientos: (withAll as any).habilitaciones_establecimientos?.length || 0,
              }
            : withAll,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
