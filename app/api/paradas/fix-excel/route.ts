import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

/**
 * POST /api/paradas/fix-excel
 * Arregla Excel cuando el nombre de calle está en la columna de código
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

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

    // Detectar columnas flexiblemente
    const firstRow = data[0]
    const keys = Object.keys(firstRow)
    
    console.log('Columnas encontradas:', keys)
    
    // Buscar columnas (más flexible)
    const codigoKey = keys.find(k => {
      const lower = k.toLowerCase().trim()
      return lower.includes('codigo') || lower.includes('código') || 
             lower.includes('parada') || lower.includes('nombre')
    })
    
    const calleKey = keys.find(k => {
      const lower = k.toLowerCase().trim()
      return lower.includes('calle') || lower.includes('direccion') || 
             lower.includes('dirección') || lower === 'calle'
    })
    
    const alturaKey = keys.find(k => {
      const lower = k.toLowerCase().trim()
      return lower.includes('altura') || lower.includes('numero') || 
             lower.includes('número') || lower === 'altura' || lower === 'nro'
    })
    
    const localidadKey = keys.find(k => {
      const lower = k.toLowerCase().trim()
      return lower.includes('localidad') || lower.includes('ciudad') || 
             lower === 'localidad'
    })

    // Si no hay columna de código, intentamos adivinar cuál tiene los nombres de calles
    const nombreCalleKey = codigoKey || calleKey || keys[0]

    // Arreglar datos: mover código a calle
    const fixed = data.map((row, index) => {
      // Obtener valores de las columnas detectadas
      const nombreCalle = row[nombreCalleKey] || ''
      const altura = alturaKey ? row[alturaKey] : (row['Altura'] || row['altura'] || row['Numero'] || row['numero'] || '')
      const localidad = localidadKey ? row[localidadKey] : (row['Localidad'] || row['localidad'] || 'Lanús')
      
      return {
        'CodigoParada': `P${String(index + 1).padStart(3, '0')}`,
        'Calle': String(nombreCalle).trim(),
        'Altura': String(altura).trim(),
        'Localidad': String(localidad).trim(),
        'Provincia': row['Provincia'] || row['provincia'] || 'Buenos Aires',
        'Pais': 'Argentina',
        'Referencia': row['Referencia'] || row['referencia'] || row['ESTADO'] || row['Estado'] || ''
      }
    })
    
    console.log(`Procesadas ${fixed.length} filas`)

    // Crear nuevo workbook
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(fixed)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Paradas Arregladas')

    // Generar buffer
    const excelBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="paradas_arregladas.xlsx"`,
      },
    })

  } catch (error: any) {
    console.error('Error al arreglar Excel:', error)
    return NextResponse.json(
      { 
        error: 'Error al procesar el archivo', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/paradas/fix-excel
 * Endpoint de prueba para verificar que la API funciona
 */
export async function GET() {
  return NextResponse.json({
    message: 'API de arreglo de Excel funcionando',
    instructions: 'Envía un POST con el archivo Excel'
  })
}
