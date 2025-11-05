/**
 * Utilidades para Geocodificación
 */

import * as crypto from 'crypto'
import * as fs from 'fs'

// Tipos
export interface ParadaRow {
  rowIndex: number
  calle: string
  altura: string
  entreCalles: string
  localidad: string
  partido: string
  provincia: string
  pais: string
  referencia: string
  codigoParada: string
  original: any
}

export interface GeocodeResult extends ParadaRow {
  fullAddress: string
  lat: number | null
  lng: number | null
  formatted_address: string | null
  place_id: string | null
  accuracy: string | null
  status: string
  retries?: number
}

export interface GeocodeCache {
  [key: string]: {
    lat: number | null
    lng: number | null
    formatted_address: string | null
    place_id: string | null
    accuracy: string | null
    status: string
  }
}

export interface GeoJSON {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  } | null
  properties: Record<string, any>
}

// Logger interface
interface Logger {
  log(message: string): void
  warn(message: string): void
  error(message: string): void
}

/**
 * Normaliza una dirección para consistencia en caché
 */
export function normalizeAddress(row: ParadaRow): string {
  const parts: string[] = []

  // Calle y altura
  if (row.calle) {
    parts.push(row.calle)
    if (row.altura) {
      parts.push(row.altura)
    }
  }

  // Entre calles
  if (row.entreCalles) {
    parts.push(`entre ${row.entreCalles}`)
  }

  // Localidad
  if (row.localidad) {
    parts.push(row.localidad)
  }

  // Partido (opcional)
  if (row.partido && row.partido !== row.localidad) {
    parts.push(row.partido)
  }

  // Provincia
  if (row.provincia) {
    parts.push(row.provincia)
  }

  // País
  if (row.pais) {
    parts.push(row.pais)
  }

  let address = parts.join(', ')

  // Normalizar abreviaturas comunes
  address = address
    .replace(/\bAv\.\s/gi, 'Avenida ')
    .replace(/\bPje\.\s/gi, 'Pasaje ')
    .replace(/\bEsq\.\s/gi, 'Esquina ')
    .replace(/\bNº\s*/gi, '')
    .replace(/\bN°\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  return address
}

/**
 * Genera hash de una dirección para caché
 */
export function hashAddress(address: string): string {
  return crypto
    .createHash('md5')
    .update(address.toLowerCase())
    .digest('hex')
}

/**
 * Carga caché desde archivo JSON
 */
export function loadCache(cachePath: string): GeocodeCache {
  if (fs.existsSync(cachePath)) {
    try {
      const data = fs.readFileSync(cachePath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.warn(`Error al cargar caché: ${error}`)
      return {}
    }
  }
  return {}
}

/**
 * Guarda caché a archivo JSON
 */
export function saveCache(cachePath: string, cache: GeocodeCache): void {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8')
}

/**
 * Geocodifica una dirección usando Google Maps Geocoding API
 */
export async function geocodeAddress(
  address: string,
  apiKey: string,
  logger: Logger,
  maxRetries: number = 5
): Promise<Omit<GeocodeResult, keyof ParadaRow | 'fullAddress'>> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
  
  let retries = 0
  let lastError: any = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url)
      const data = await response.json()

      // Revisar si hay error de API
      if (data.error_message) {
        logger.error(`API Error: ${data.error_message}`)
        return {
          lat: null,
          lng: null,
          formatted_address: null,
          place_id: null,
          accuracy: null,
          status: 'ERROR',
          retries: attempt
        }
      }

      // Manejar rate limiting
      if (data.status === 'OVER_QUERY_LIMIT') {
        retries++
        const backoff = Math.pow(2, attempt) * 500 // Backoff exponencial
        logger.warn(`OVER_QUERY_LIMIT, esperando ${backoff}ms...`)
        await new Promise(resolve => setTimeout(resolve, backoff))
        continue
      }

      // Sin resultados
      if (data.status === 'ZERO_RESULTS') {
        return {
          lat: null,
          lng: null,
          formatted_address: null,
          place_id: null,
          accuracy: null,
          status: 'ZERO_RESULTS',
          retries: attempt
        }
      }

      // Error de request
      if (data.status === 'REQUEST_DENIED') {
        logger.error(`REQUEST_DENIED: ${data.error_message || 'Revisa tu API key'}`)
        return {
          lat: null,
          lng: null,
          formatted_address: null,
          place_id: null,
          accuracy: null,
          status: 'REQUEST_DENIED',
          retries: attempt
        }
      }

      // Éxito
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0]
        const location = result.geometry.location
        const accuracy = result.geometry.location_type

        // Nudge: marcar baja precisión si es necesario
        let finalStatus = 'OK'
        if (accuracy === 'RANGE_INTERPOLATED' || accuracy === 'APPROXIMATE') {
          finalStatus = 'baja_precision'
        }

        return {
          lat: location.lat,
          lng: location.lng,
          formatted_address: result.formatted_address,
          place_id: result.place_id,
          accuracy: accuracy,
          status: finalStatus,
          retries: attempt
        }
      }

      // Otro status no manejado
      return {
        lat: null,
        lng: null,
        formatted_address: null,
        place_id: null,
        accuracy: null,
        status: data.status || 'UNKNOWN',
        retries: attempt
      }

    } catch (error: any) {
      lastError = error
      retries++
      const backoff = Math.pow(2, attempt) * 500
      logger.warn(`Error en geocodificación (intento ${attempt + 1}/${maxRetries + 1}): ${error.message}`)
      if (attempt < maxRetries) {
        logger.warn(`Reintentando en ${backoff}ms...`)
        await new Promise(resolve => setTimeout(resolve, backoff))
      }
    }
  }

  // Todos los intentos fallaron
  logger.error(`Falló después de ${maxRetries + 1} intentos: ${lastError?.message}`)
  return {
    lat: null,
    lng: null,
    formatted_address: null,
    place_id: null,
    accuracy: null,
    status: 'NETWORK_ERROR',
    retries: maxRetries
  }
}

/**
 * Construye CSV desde resultados
 */
export function buildCSV(results: GeocodeResult[]): string {
  const headers = [
    'codigoParada',
    'calle',
    'altura',
    'entreCalles',
    'localidad',
    'partido',
    'provincia',
    'pais',
    'referencia',
    'fullAddress',
    'lat',
    'lng',
    'formatted_address',
    'place_id',
    'accuracy',
    'status'
  ]

  const rows = results.map(r => [
    escapeCsv(r.codigoParada),
    escapeCsv(r.calle),
    escapeCsv(r.altura),
    escapeCsv(r.entreCalles),
    escapeCsv(r.localidad),
    escapeCsv(r.partido),
    escapeCsv(r.provincia),
    escapeCsv(r.pais),
    escapeCsv(r.referencia),
    escapeCsv(r.fullAddress),
    r.lat ?? '',
    r.lng ?? '',
    escapeCsv(r.formatted_address ?? ''),
    escapeCsv(r.place_id ?? ''),
    escapeCsv(r.accuracy ?? ''),
    r.status
  ])

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
}

/**
 * Escapa valores CSV
 */
function escapeCsv(value: string): string {
  if (!value) return ''
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Construye GeoJSON desde resultados
 */
export function buildGeoJSON(results: GeocodeResult[]): GeoJSON {
  const features: GeoJSONFeature[] = results.map(r => ({
    type: 'Feature',
    geometry: r.lat && r.lng ? {
      type: 'Point',
      coordinates: [r.lng, r.lat] // GeoJSON usa [lng, lat]
    } : null,
    properties: {
      codigoParada: r.codigoParada,
      calle: r.calle,
      altura: r.altura,
      entreCalles: r.entreCalles,
      localidad: r.localidad,
      partido: r.partido,
      provincia: r.provincia,
      pais: r.pais,
      referencia: r.referencia,
      fullAddress: r.fullAddress,
      formatted_address: r.formatted_address,
      place_id: r.place_id,
      accuracy: r.accuracy,
      status: r.status
    }
  }))

  return {
    type: 'FeatureCollection',
    features
  }
}

/**
 * Estima el costo de geocodificación
 * Precios de Google Maps Geocoding API (Noviembre 2024)
 * - 0-100,000 requests/mes: $5 por 1000 requests
 * - 100,001-500,000: $4 por 1000 requests
 */
export function estimateCost(requests: number): string {
  if (requests === 0) return '$0.00 USD'
  
  let cost = 0
  
  if (requests <= 100000) {
    cost = (requests / 1000) * 5
  } else if (requests <= 500000) {
    cost = (100000 / 1000) * 5 + ((requests - 100000) / 1000) * 4
  } else {
    cost = (100000 / 1000) * 5 + (400000 / 1000) * 4 + ((requests - 500000) / 1000) * 4
  }

  return `$${cost.toFixed(2)} USD (~${requests} requests)`
}
