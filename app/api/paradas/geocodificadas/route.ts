import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export const dynamic = 'force-dynamic'

/**
 * GET /api/paradas/geocodificadas
 * Sirve el GeoJSON generado por el script de geocodificación
 */
export async function GET() {
  try {
    const geojsonPath = path.join(process.cwd(), 'paradas', 'out', 'paradas_geocodificadas.geojson')

    if (!fs.existsSync(geojsonPath)) {
      return NextResponse.json(
        { 
          error: 'Archivo GeoJSON no encontrado',
          message: 'Ejecuta primero: npm run geocode'
        },
        { status: 404 }
      )
    }

    const data = fs.readFileSync(geojsonPath, 'utf-8')
    const geojson = JSON.parse(data)

    return NextResponse.json(geojson, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error: any) {
    console.error('Error al leer GeoJSON:', error)
    return NextResponse.json(
      { error: 'Error al leer archivo GeoJSON', details: error.message },
      { status: 500 }
    )
  }
}
