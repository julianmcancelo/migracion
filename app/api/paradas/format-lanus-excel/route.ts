import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

/**
 * POST /api/paradas/format-lanus-excel
 * Formatea el Excel de Lanús con el formato específico de paradas
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

    console.log('Columnas detectadas:', Object.keys(data[0]))
    console.log('Primera fila:', data[0])

    // Mapear datos al formato correcto para geocodificación
    const formatted = data.map((row, index) => {
      // Buscar las columnas por diferentes nombres posibles
      const avenida = row['AVENIDA'] || row['Avenida'] || row['avenida'] || row['CALLE'] || row['Calle'] || ''
      const altura = row['ALTURA'] || row['Altura'] || row['altura'] || row['ALTUR'] || row['NUMERO'] || ''
      const interseccion = row['INTERSECCION'] || row['Interseccion'] || row['interseccion'] || row['ENTRE CALLES'] || ''
      const tipo = row['TIPO'] || row['Tipo'] || row['tipo'] || ''
      const orientacion = row['ORIENTACION'] || row['Orientacion'] || row['orientacion'] || ''
      const nroObje = row['N° OBJE'] || row['Nº OBJE'] || row['Numero'] || ''

      // Generar código de parada
      const codigoParada = nroObje || `P${String(index + 1).padStart(4, '0')}`
      
      // Construir dirección completa para geocodificación
      const calleStr = String(avenida).trim()
      const alturaStr = String(altura).trim()
      const direccionCompleta = alturaStr 
        ? `${calleStr} ${alturaStr}, Lanús, Buenos Aires, Argentina`
        : `${calleStr}, Lanús, Buenos Aires, Argentina`

      return {
        'CodigoParada': String(codigoParada).trim(),
        'Calle': calleStr,
        'Altura': alturaStr,
        'EntreCalles': String(interseccion).trim(),
        'Localidad': 'Lanús',
        'Provincia': 'Buenos Aires',
        'Pais': 'Argentina',
        'Tipo': String(tipo).trim(),
        'Orientacion': String(orientacion).trim(),
        'Referencia': `${tipo} - ${orientacion}`.trim(),
        'DireccionBusqueda': direccionCompleta, // Dirección completa con altura para geocodificar
        'Latitud': '', // Se llenará con geocodificación
        'Longitud': '', // Se llenará con geocodificación
        'DireccionGeocoded': '', // Resultado de Google
        'PlaceID': '', // Se llenará con geocodificación
        'Precision': '' // Se llenará con geocodificación
      }
    })

    console.log(`✅ Formateadas ${formatted.length} paradas`)
    console.log('Ejemplo de fila formateada:', formatted[0])

    // Crear nuevo workbook con el formato correcto
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(formatted)

    // Ajustar anchos de columna
    const columnWidths = [
      { wch: 12 }, // CodigoParada
      { wch: 25 }, // Calle
      { wch: 8 },  // Altura
      { wch: 25 }, // EntreCalles
      { wch: 15 }, // Localidad
      { wch: 15 }, // Provincia
      { wch: 12 }, // Pais
      { wch: 20 }, // Tipo
      { wch: 15 }, // Orientacion
      { wch: 30 }, // Referencia
      { wch: 12 }, // Latitud
      { wch: 12 }, // Longitud
      { wch: 40 }, // DireccionCompleta
      { wch: 30 }, // PlaceID
      { wch: 12 }  // Precision
    ]
    newWorksheet['!cols'] = columnWidths

    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Paradas Lanús')

    // Generar buffer
    const excelBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="paradas_lanus_formato_geocode.xlsx"`,
      },
    })

  } catch (error: any) {
    console.error('Error al formatear Excel:', error)
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
