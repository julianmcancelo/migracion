import { NextRequest } from 'next/server'
import * as XLSX from 'xlsx'
import { normalizeAddress, geocodeAddress, buildCSV, buildGeoJSON, type ParadaRow, type GeocodeResult } from '@/scripts/geocode-utils'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutos max

/**
 * POST /api/paradas/geocode
 * Geocodifica paradas desde Excel con streaming de progreso
 */
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  // Crear stream de respuesta
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const sheet = formData.get('sheet') as string || ''
        const rate = parseInt(formData.get('rate') as string) || 50
        const maxRequests = parseInt(formData.get('maxRequests') as string) || 0

        if (!file) {
          sendSSE(controller, 'error', { message: 'No se recibió ningún archivo' })
          controller.close()
          return
        }

        // Validar API Key
        const apiKey = process.env.GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          sendSSE(controller, 'error', { message: 'API Key no configurada en el servidor' })
          controller.close()
          return
        }

        // Leer Excel
        const buffer = Buffer.from(await file.arrayBuffer())
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = sheet || workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        if (!worksheet) {
          sendSSE(controller, 'error', { message: `Hoja no encontrada: ${sheetName}` })
          controller.close()
          return
        }

        const data = XLSX.utils.sheet_to_json<any>(worksheet)

        // Detectar columnas
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
          const entreCalles = detectColumn(row, ['entre', 'entrecalles']) || ''
          const localidad = detectColumn(row, ['localidad', 'ciudad']) || 'Lanús'
          const partido = detectColumn(row, ['partido', 'municipio']) || ''
          const provincia = detectColumn(row, ['provincia', 'prov']) || 'Buenos Aires'
          const pais = detectColumn(row, ['pais', 'país']) || 'Argentina'
          const referencia = detectColumn(row, ['referencia', 'observaciones']) || ''
          const codigo = detectColumn(row, ['codigo', 'id', 'codigoparada']) || `P${index + 1}`

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

        const total = maxRequests > 0 ? Math.min(rows.length, maxRequests) : rows.length
        const results: GeocodeResult[] = []
        let processed = 0
        let ok = 0
        let errors = 0

        const delayBetweenRequests = Math.ceil(60000 / rate)

        // Geocodificar una por una
        for (let i = 0; i < total; i++) {
          const row = rows[i]
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
            errors++
            processed++
            
            sendSSE(controller, 'progress', {
              total,
              processed,
              ok,
              errors,
              currentAddress: fullAddress,
              status: 'processing'
            })
            continue
          }

          // Geocodificar
          const logger = {
            log: (msg: string) => console.log(msg),
            warn: (msg: string) => console.warn(msg),
            error: (msg: string) => console.error(msg)
          }

          const result = await geocodeAddress(fullAddress, apiKey, logger, 3)
          
          results.push({
            ...row,
            fullAddress,
            ...result
          })

          if (result.status === 'OK' || result.status === 'baja_precision') {
            ok++
          } else {
            errors++
          }

          processed++

          // Enviar progreso
          sendSSE(controller, 'progress', {
            total,
            processed,
            ok,
            errors,
            currentAddress: fullAddress,
            status: 'processing'
          })

          // Delay entre requests
          if (i < total - 1) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenRequests))
          }
        }

        // Construir outputs
        const csv = buildCSV(results)
        const geojson = buildGeoJSON(results)
        const reporte = {
          timestamp: new Date().toISOString(),
          total_filas: total,
          geocodificadas_ok: ok,
          errores: errors,
          costo_estimado: `$${(total * 0.005).toFixed(2)} USD`
        }

        // Enviar resultado final
        sendSSE(controller, 'complete', {
          csv,
          geojson,
          reporte
        })

      } catch (error: any) {
        console.error('Error en geocodificación:', error)
        sendSSE(controller, 'error', { message: error.message })
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// Helper para enviar Server-Sent Events
function sendSSE(controller: ReadableStreamDefaultController, type: string, data: any) {
  const encoder = new TextEncoder()
  const message = `data: ${JSON.stringify({ type, data })}\n\n`
  controller.enqueue(encoder.encode(message))
}
