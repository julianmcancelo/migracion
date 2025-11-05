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

    // Detectar si necesita arreglo
    const firstRow = data[0]
    const codigoKey = Object.keys(firstRow).find(k => 
      k.toLowerCase().includes('codigo') || k.toLowerCase().includes('código')
    )
    const calleKey = Object.keys(firstRow).find(k => 
      k.toLowerCase().includes('calle') || k.toLowerCase().includes('direccion')
    )

    if (!codigoKey) {
      return NextResponse.json(
        { error: 'No se encontró columna de código' },
        { status: 400 }
      )
    }

    // Arreglar datos: mover código a calle
    const fixed = data.map((row, index) => {
      const codigo = codigoKey ? row[codigoKey] : ''
      const calle = calleKey ? row[calleKey] || '' : ''
      
      return {
        'CodigoParada': `P${String(index + 1).padStart(3, '0')}`,
        'Calle': codigo || calle, // El nombre de calle que estaba en código
        'Altura': row['Altura'] || row['altura'] || row['Numero'] || row['numero'] || '',
        'Localidad': row['Localidad'] || row['localidad'] || 'Lanús',
        'Provincia': row['Provincia'] || row['provincia'] || 'Buenos Aires',
        'Referencia': row['Referencia'] || row['referencia'] || row['ESTADO'] || ''
      }
    })

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
      { error: 'Error al procesar el archivo', details: error.message },
      { status: 500 }
    )
  }
}
