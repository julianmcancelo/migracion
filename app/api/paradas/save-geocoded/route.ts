import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/paradas/save-geocoded
 * Guarda paradas geocodificadas en la base de datos
 */
export async function POST(request: NextRequest) {
  try {
    const { features } = await request.json()

    if (!features || !Array.isArray(features)) {
      return NextResponse.json(
        { error: 'Se requiere un array de features GeoJSON' },
        { status: 400 }
      )
    }

    // Filtrar solo features con coordenadas válidas
    const validFeatures = features.filter(f => 
      f.geometry !== null && 
      f.geometry.coordinates && 
      f.geometry.coordinates.length === 2
    )

    if (validFeatures.length === 0) {
      return NextResponse.json(
        { error: 'No hay paradas con coordenadas válidas para guardar' },
        { status: 400 }
      )
    }

    const results = {
      total: validFeatures.length,
      created: 0,
      updated: 0,
      errors: [] as string[]
    }

    // Procesar cada parada
    for (const feature of validFeatures) {
      try {
        const { properties, geometry } = feature
        const [lng, lat] = geometry.coordinates

        // Datos para insertar/actualizar
        const paradaData = {
          titulo: properties.codigoParada || properties.calle || 'Sin nombre',
          tipo: 'transporte' as const,
          descripcion: properties.fullAddress || properties.formatted_address,
          latitud: lat,
          longitud: lng,
          estado: properties.status === 'OK' || properties.status === 'baja_precision' 
            ? 'ok' as const 
            : 'falla' as const,
          activo: true,
          metadata: {
            calle: properties.calle,
            altura: properties.altura,
            localidad: properties.localidad,
            provincia: properties.provincia,
            formatted_address: properties.formatted_address,
            place_id: properties.place_id,
            accuracy: properties.accuracy,
            geocode_status: properties.status,
            referencia: properties.referencia,
            geocoded_at: new Date().toISOString()
          }
        }

        // Buscar si ya existe por título (codigoParada)
        const existing = await prisma.paradas.findFirst({
          where: {
            titulo: paradaData.titulo
          }
        })

        if (existing) {
          // Actualizar coordenadas
          await prisma.paradas.update({
            where: { id: existing.id },
            data: {
              latitud: paradaData.latitud,
              longitud: paradaData.longitud,
              descripcion: paradaData.descripcion,
              metadata: paradaData.metadata
            }
          })
          results.updated++
        } else {
          // Crear nueva parada
          await prisma.paradas.create({
            data: paradaData
          })
          results.created++
        }

      } catch (error: any) {
        console.error('Error al procesar parada:', error)
        results.errors.push(`${feature.properties.codigoParada}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Guardadas ${results.created} nuevas y actualizadas ${results.updated} paradas`,
      ...results
    })

  } catch (error: any) {
    console.error('Error al guardar paradas:', error)
    return NextResponse.json(
      { error: 'Error al guardar en base de datos', details: error.message },
      { status: 500 }
    )
  }
}
