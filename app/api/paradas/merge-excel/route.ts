import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

/**
 * POST /api/paradas/merge-excel
 * Unifica múltiples archivos Excel en uno solo
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No se recibieron archivos' },
        { status: 400 }
      )
    }

    console.log(`📥 Recibidos ${files.length} archivos para unificar`)

    let allData: any[] = []
    const filesSummary: any[] = []

    // Procesar cada archivo
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json<any>(worksheet)

        allData = allData.concat(data)
        
        filesSummary.push({
          archivo: file.name,
          filas: data.length,
          orden: i + 1
        })

        console.log(`✅ ${file.name}: ${data.length} filas`)
      } catch (error: any) {
        console.error(`❌ Error en ${file.name}:`, error.message)
        filesSummary.push({
          archivo: file.name,
          error: error.message,
          orden: i + 1
        })
      }
    }

    if (allData.length === 0) {
      return NextResponse.json(
        { error: 'No se pudo leer ningún archivo' },
        { status: 400 }
      )
    }

    console.log(`📊 Total unificado: ${allData.length} filas`)

    // Crear workbook unificado
    const mergedWorkbook = XLSX.utils.book_new()
    const mergedWorksheet = XLSX.utils.json_to_sheet(allData)
    
    // Ajustar anchos de columna
    const columnWidths = Object.keys(allData[0] || {}).map(() => ({ wch: 15 }))
    mergedWorksheet['!cols'] = columnWidths

    XLSX.utils.book_append_sheet(mergedWorkbook, mergedWorksheet, 'Paradas Unificadas')

    // Agregar hoja de resumen
    const resumenData = [
      { 'Métrica': 'Total de archivos procesados', 'Valor': files.length },
      { 'Métrica': 'Total de filas unificadas', 'Valor': allData.length },
      { 'Métrica': 'Fecha de unificación', 'Valor': new Date().toLocaleString('es-AR') },
      {},
      { 'Métrica': 'Detalle por archivo', 'Valor': '' },
      ...filesSummary.map(f => ({
        'Métrica': `${f.orden}. ${f.archivo}`,
        'Valor': f.error ? `ERROR: ${f.error}` : `${f.filas} filas`
      }))
    ]

    const resumenWorksheet = XLSX.utils.json_to_sheet(resumenData)
    XLSX.utils.book_append_sheet(mergedWorkbook, resumenWorksheet, 'Resumen')

    // Generar buffer
    const excelBuffer = XLSX.write(mergedWorkbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="paradas_unificadas_${allData.length}_filas.xlsx"`,
      },
    })

  } catch (error: any) {
    console.error('Error al unificar archivos:', error)
    return NextResponse.json(
      { 
        error: 'Error al unificar archivos', 
        details: error.message
      },
      { status: 500 }
    )
  }
}
