import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

/**
 * POST /api/paradas/upload-excel
 * Analiza un archivo Excel y devuelve información básica
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

    // Obtener nombres de hojas
    const sheetNames = workbook.SheetNames

    // Contar filas de la primera hoja
    const firstSheet = workbook.Sheets[sheetNames[0]]
    const data = XLSX.utils.sheet_to_json(firstSheet)
    const rowCount = data.length

    return NextResponse.json({
      success: true,
      sheets: sheetNames,
      rowCount,
      fileName: file.name
    })
  } catch (error: any) {
    console.error('Error al analizar Excel:', error)
    return NextResponse.json(
      { error: 'Error al analizar el archivo', details: error.message },
      { status: 500 }
    )
  }
}
