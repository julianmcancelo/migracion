#!/usr/bin/env tsx
/**
 * Script de Geocodificación de Paradas
 * 
 * Lee un archivo Excel con direcciones de paradas, las geocodifica usando
 * Google Maps Geocoding API y genera archivos CSV y GeoJSON.
 * 
 * Uso:
 *   npm run geocode
 *   npm run geocode:dry
 *   npm run geocode -- --sheet="Hoja1" --rate=40 --max-requests=100
 */

import * as fs from 'fs'
import * as path from 'path'
import * as XLSX from 'xlsx'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import pLimit from 'p-limit'
import { config } from 'dotenv'
import { 
  normalizeAddress, 
  geocodeAddress, 
  loadCache, 
  saveCache,
  buildGeoJSON,
  buildCSV,
  estimateCost,
  type GeocodeResult,
  type ParadaRow,
  type GeocodeCache
} from './geocode-utils.js'

// Cargar variables de entorno
config({ path: '.env.local' })
config({ path: '.env' })

// Configuración CLI
const argv = yargs(hideBin(process.argv))
  .option('dry-run', {
    alias: 'd',
    type: 'boolean',
    description: 'Modo de prueba sin consumir API',
    default: false
  })
  .option('in', {
    alias: 'i',
    type: 'string',
    description: 'Ruta del archivo Excel de entrada',
    default: './paradas/PARADAS INTERVENIDAS Y NUEVAS.xlsx'
  })
  .option('sheet', {
    alias: 's',
    type: 'string',
    description: 'Nombre de la hoja de Excel',
    default: ''
  })
  .option('rate', {
    alias: 'r',
    type: 'number',
    description: 'Requests por minuto',
    default: 50
  })
  .option('max-requests', {
    alias: 'm',
    type: 'number',
    description: 'Máximo de requests a realizar',
    default: 0
  })
  .option('country', {
    alias: 'c',
    type: 'string',
    description: 'País por defecto',
    default: 'Argentina'
  })
  .option('localidad-fallback', {
    alias: 'l',
    type: 'string',
    description: 'Localidad por defecto si falta',
    default: 'Lanús'
  })
  .help()
  .parseSync()

// Directorios
const CACHE_DIR = path.join(process.cwd(), 'paradas', 'cache')
const OUT_DIR = path.join(process.cwd(), 'paradas', 'out')
const LOG_FILE = path.join(OUT_DIR, 'geocode.log')

// Crear directorios si no existen
;[CACHE_DIR, OUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// Logger
class Logger {
  private logStream: fs.WriteStream

  constructor(logFile: string) {
    this.logStream = fs.createWriteStream(logFile, { flags: 'a' })
  }

  log(message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${level}] ${message}`
    console.log(logMessage)
    this.logStream.write(logMessage + '\n')
  }

  error(message: string) {
    this.log(message, 'ERROR')
  }

  warn(message: string) {
    this.log(message, 'WARN')
  }

  close() {
    this.logStream.end()
  }
}

const logger = new Logger(LOG_FILE)

// Validar API key
function validateApiKey(): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    logger.error('GOOGLE_MAPS_API_KEY no está configurada en .env.local')
    logger.error('Por favor, copia .env.example a .env.local y configura tu API key')
    process.exit(1)
  }
  return apiKey
}

// Leer Excel
function readExcel(filePath: string, sheetName?: string): ParadaRow[] {
  logger.log(`Leyendo archivo: ${filePath}`)
  
  if (!fs.existsSync(filePath)) {
    logger.error(`Archivo no encontrado: ${filePath}`)
    process.exit(1)
  }

  const workbook = XLSX.readFile(filePath)
  const sheet = sheetName 
    ? workbook.Sheets[sheetName]
    : workbook.Sheets[workbook.SheetNames[0]]

  if (!sheet) {
    logger.error(`Hoja no encontrada: ${sheetName || workbook.SheetNames[0]}`)
    logger.log(`Hojas disponibles: ${workbook.SheetNames.join(', ')}`)
    process.exit(1)
  }

  const data = XLSX.utils.sheet_to_json<any>(sheet)
  logger.log(`Se encontraron ${data.length} filas`)

  // Detectar columnas con heurísticas
  const detectColumn = (row: any, patterns: string[]): string | undefined => {
    for (const pattern of patterns) {
      const found = Object.keys(row).find(key => 
        key.toLowerCase().includes(pattern.toLowerCase())
      )
      if (found) return row[found]
    }
    return undefined
  }

  // Convertir a ParadaRow
  const rows: ParadaRow[] = data.map((row, index) => {
    const calle = detectColumn(row, ['calle', 'dirección', 'direccion', 'via']) || ''
    const altura = detectColumn(row, ['altura', 'numero', 'número', 'nro']) || ''
    const entreCalles = detectColumn(row, ['entre', 'entrecalles', 'entre_calles']) || ''
    const localidad = detectColumn(row, ['localidad', 'ciudad']) || argv['localidad-fallback']
    const partido = detectColumn(row, ['partido', 'municipio']) || ''
    const provincia = detectColumn(row, ['provincia', 'prov']) || 'Buenos Aires'
    const pais = detectColumn(row, ['pais', 'país', 'country']) || argv.country
    const referencia = detectColumn(row, ['referencia', 'observaciones', 'obs', 'detalle']) || ''
    const codigo = detectColumn(row, ['codigo', 'código', 'id', 'codigoparada']) || `P${index + 1}`

    return {
      rowIndex: index + 1,
      calle: String(calle).trim(),
      altura: String(altura).trim(),
      entreCalles: String(entreCalles).trim(),
      localidad: String(localidad).trim(),
      partido: String(partido).trim(),
      provincia: String(provincia).trim(),
      pais: String(pais).trim(),
      referencia: String(referencia).trim(),
      codigoParada: String(codigo).trim(),
      original: row
    }
  })

  return rows
}

// Main
async function main() {
  logger.log('=== INICIO DE GEOCODIFICACIÓN ===')
  logger.log(`Modo: ${argv['dry-run'] ? 'DRY RUN' : 'PRODUCCIÓN'}`)
  
  const apiKey = argv['dry-run'] ? 'DRY_RUN_KEY' : validateApiKey()
  
  // Leer Excel
  const rows = readExcel(argv.in as string, argv.sheet as string)
  
  // Cargar caché
  const cachePath = path.join(CACHE_DIR, 'geocode-cache.json')
  let cache = loadCache(cachePath)
  
  // Preparar filas para geocodificar
  const toGeocode: ParadaRow[] = []
  const results: GeocodeResult[] = []
  let cacheHits = 0
  let insuficientes = 0

  for (const row of rows) {
    const fullAddress = normalizeAddress(row)
    
    // Validar datos mínimos
    if (!row.calle || (!row.altura && !row.entreCalles)) {
      results.push({
        ...row,
        fullAddress,
        lat: null,
        lng: null,
        formatted_address: null,
        place_id: null,
        accuracy: null,
        status: 'insuficiente'
      })
      insuficientes++
      continue
    }

    // Revisar caché
    const cached = cache[fullAddress]
    if (cached && cached.status === 'OK') {
      results.push({
        ...row,
        fullAddress,
        ...cached
      })
      cacheHits++
      continue
    }

    toGeocode.push(row)
  }

  logger.log(`Total de filas: ${rows.length}`)
  logger.log(`Datos insuficientes: ${insuficientes}`)
  logger.log(`Caché hits: ${cacheHits}`)
  logger.log(`A geocodificar: ${toGeocode.length}`)

  // Dry run
  if (argv['dry-run']) {
    logger.log('\n=== DRY RUN MODE ===')
    logger.log('Direcciones que se geocodificarían:')
    toGeocode.forEach((row, i) => {
      logger.log(`${i + 1}. ${normalizeAddress(row)}`)
    })
    logger.log(`\nCosto estimado: ${estimateCost(toGeocode.length)}`)
    logger.close()
    return
  }

  // Validar max requests
  let requestsToMake = toGeocode.length
  if (argv['max-requests'] > 0 && requestsToMake > argv['max-requests']) {
    logger.warn(`Limitando a ${argv['max-requests']} requests (de ${requestsToMake})`)
    requestsToMake = argv['max-requests']
  }

  // Rate limiting
  const limit = pLimit(1) // 1 request a la vez
  const delayBetweenRequests = Math.ceil(60000 / (argv.rate as number))
  logger.log(`Delay entre requests: ${delayBetweenRequests}ms (${argv.rate} rpm)`)

  // Geocodificar
  logger.log('\n=== GEOCODIFICANDO ===')
  const startTime = Date.now()
  let geocoded = 0
  let failed = 0
  let retries = 0

  const geocodePromises = toGeocode.slice(0, requestsToMake).map((row, index) =>
    limit(async () => {
      const fullAddress = normalizeAddress(row)
      
      // Delay
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests))
      }

      const result = await geocodeAddress(fullAddress, apiKey, logger)
      
      // Actualizar caché
      cache[fullAddress] = {
        lat: result.lat,
        lng: result.lng,
        formatted_address: result.formatted_address,
        place_id: result.place_id,
        accuracy: result.accuracy,
        status: result.status
      }
      saveCache(cachePath, cache)

      results.push({
        ...row,
        fullAddress,
        ...result
      })

      if (result.status === 'OK') {
        geocoded++
        logger.log(`✓ [${geocoded}/${requestsToMake}] ${row.codigoParada}: ${fullAddress}`)
      } else {
        failed++
        logger.warn(`✗ [${failed} failed] ${row.codigoParada}: ${result.status}`)
      }

      if (result.retries) {
        retries += result.retries
      }

      return result
    })
  )

  await Promise.all(geocodePromises)

  const endTime = Date.now()
  const totalTime = ((endTime - startTime) / 1000).toFixed(2)

  // Agregar filas no procesadas
  if (requestsToMake < toGeocode.length) {
    const remaining = toGeocode.slice(requestsToMake)
    remaining.forEach(row => {
      results.push({
        ...row,
        fullAddress: normalizeAddress(row),
        lat: null,
        lng: null,
        formatted_address: null,
        place_id: null,
        accuracy: null,
        status: 'pending'
      })
    })
  }

  // Exportar CSV
  const csvPath = path.join(OUT_DIR, 'paradas_geocodificadas.csv')
  const csv = buildCSV(results)
  fs.writeFileSync(csvPath, csv, 'utf-8')
  logger.log(`\n✓ CSV guardado: ${csvPath}`)

  // Exportar GeoJSON
  const geojsonPath = path.join(OUT_DIR, 'paradas_geocodificadas.geojson')
  const geojson = buildGeoJSON(results)
  fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2), 'utf-8')
  logger.log(`✓ GeoJSON guardado: ${geojsonPath}`)

  // Reporte
  const reporte = {
    timestamp: new Date().toISOString(),
    total_filas: rows.length,
    datos_insuficientes: insuficientes,
    cache_hits: cacheHits,
    geocodificadas_ok: geocoded,
    sin_match: results.filter(r => r.status === 'ZERO_RESULTS').length,
    errores: failed,
    pending: results.filter(r => r.status === 'pending').length,
    reintentos: retries,
    tiempo_total_seg: parseFloat(totalTime),
    requests_realizados: geocoded + failed,
    costo_estimado: estimateCost(geocoded + failed)
  }

  const reportePath = path.join(OUT_DIR, 'reporte_geocode.json')
  fs.writeFileSync(reportePath, JSON.stringify(reporte, null, 2), 'utf-8')
  logger.log(`✓ Reporte guardado: ${reportePath}`)

  // Resumen
  logger.log('\n=== RESUMEN ===')
  logger.log(`Total de filas: ${reporte.total_filas}`)
  logger.log(`Geocodificadas OK: ${reporte.geocodificadas_ok}`)
  logger.log(`Sin match: ${reporte.sin_match}`)
  logger.log(`Datos insuficientes: ${reporte.datos_insuficientes}`)
  logger.log(`Errores: ${reporte.errores}`)
  logger.log(`Pendientes: ${reporte.pending}`)
  logger.log(`Caché hits: ${reporte.cache_hits}`)
  logger.log(`Reintentos: ${reporte.reintentos}`)
  logger.log(`Tiempo total: ${reporte.tiempo_total_seg}s`)
  logger.log(`Costo estimado: ${reporte.costo_estimado}`)

  logger.log('\n=== FIN ===')
  logger.close()
}

// Ejecutar
main().catch(error => {
  logger.error(`Error fatal: ${error.message}`)
  logger.error(error.stack)
  logger.close()
  process.exit(1)
})
