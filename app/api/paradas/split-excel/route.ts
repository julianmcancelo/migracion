import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

/**
 * POST /api/paradas/split-excel
 * Divide un Excel grande en archivos más pequeños
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const rowsPerFile = parseInt(formData.get('rowsPerFile') as string || '50')

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo' },
        { status: 400 }
      )
    }

    // Leer el archivo
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json<any>(worksheet)

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'El archivo Excel está vacío' },
        { status: 400 }
      )
    }

    console.log(`📊 Total de filas: ${data.length}`)
    console.log(`✂️ Dividiendo en lotes de ${rowsPerFile} filas`)

    // Dividir en chunks
    const chunks: any[][] = []
    for (let i = 0; i < data.length; i += rowsPerFile) {
      chunks.push(data.slice(i, i + rowsPerFile))
    }

    console.log(`📦 Creados ${chunks.length} archivos`)

    // Crear un ZIP con todos los archivos
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    chunks.forEach((chunk, index) => {
      const chunkWorkbook = XLSX.utils.book_new()
      const chunkWorksheet = XLSX.utils.json_to_sheet(chunk)
      XLSX.utils.book_append_sheet(chunkWorkbook, chunkWorksheet, sheetName)
      
      const buffer = XLSX.write(chunkWorkbook, { type: 'buffer', bookType: 'xlsx' })
      
      const startRow = index * rowsPerFile + 1
      const endRow = Math.min((index + 1) * rowsPerFile, data.length)
      const fileName = `lote_${String(index + 1).padStart(3, '0')}_filas_${startRow}-${endRow}.xlsx`
      zip.file(fileName, buffer)
    })

    // Agregar archivo de resumen
    const resumen = {
      total_filas: data.length,
      filas_por_archivo: rowsPerFile,
      total_archivos: chunks.length,
      archivos: chunks.map((chunk, index) => ({
        archivo: `lote_${String(index + 1).padStart(3, '0')}`,
        filas: chunk.length,
        desde: index * rowsPerFile + 1,
        hasta: Math.min((index + 1) * rowsPerFile, data.length)
      }))
    }
    
    zip.file('RESUMEN.json', JSON.stringify(resumen, null, 2))
    zip.file('INSTRUCCIONES.txt', 
      `📦 ARCHIVOS DIVIDIDOS PARA GEOCODIFICACIÓN\n\n` +
      `Total de registros: ${data.length}\n` +
      `Archivos generados: ${chunks.length}\n` +
      `Filas por archivo: ${rowsPerFile}\n\n` +
      `INSTRUCCIONES:\n` +
      `1. Geocodifica cada archivo por separado\n` +
      `2. Guarda los resultados geocodificados\n` +
      `3. Usa la función "Unificar Archivos" para combinarlos\n\n` +
      `VENTAJAS:\n` +
      `- Procesar en lotes evita timeouts\n` +
      `- Si falla uno, no pierdes todo\n` +
      `- Puedes pausar y continuar después\n`
    )

    // Generar ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    const zipArray = new Uint8Array(zipBuffer)

    return new NextResponse(zipArray, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="paradas_divididas_${chunks.length}_archivos.zip"`,
      },
    })

  } catch (error: any) {
    console.error('Error al dividir Excel:', error)
    return NextResponse.json(
      { 
        error: 'Error al dividir el archivo', 
        details: error.message
      },
      { status: 500 }
    )
  }
}
