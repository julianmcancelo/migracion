import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/paradas/geocode-single
 * Geocodifica una dirección individual
 */
export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json(
        { error: 'Dirección requerida' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key no configurada' },
        { status: 500 }
      )
    }

    // Llamar a Google Maps Geocoding API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0]
      const location = result.geometry.location

      return NextResponse.json({
        success: true,
        address: address,
        formatted_address: result.formatted_address,
        lat: location.lat,
        lng: location.lng,
        place_id: result.place_id,
        accuracy: result.geometry.location_type
      })
    } else if (data.status === 'ZERO_RESULTS') {
      return NextResponse.json({
        success: false,
        error: 'No se encontraron resultados para esta dirección'
      }, { status: 404 })
    } else if (data.status === 'REQUEST_DENIED') {
      return NextResponse.json({
        success: false,
        error: 'API Key inválida o sin permisos'
      }, { status: 403 })
    } else {
      return NextResponse.json({
        success: false,
        error: `Error de Google Maps: ${data.status}`
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error en geocodificación individual:', error)
    return NextResponse.json(
      { error: 'Error al geocodificar', details: error.message },
      { status: 500 }
    )
  }
}
