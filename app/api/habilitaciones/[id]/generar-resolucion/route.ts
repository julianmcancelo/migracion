import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import fs from 'fs'
import path from 'path'

/**
 * GET /api/habilitaciones/[id]/generar-resolucion
 * Genera un documento Word (.docx) con la resolución de habilitación
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const habilitacionId = Number(id)

    // Consulta SQL unificada para obtener todos los datos
    const sql = `
      SELECT
        p.id AS persona_id,
        p.nombre AS titular_nombre,
        p.genero,
        p.dni AS titular_dni,
        p.domicilio_calle,
        p.domicilio_nro,
        p.domicilio_localidad,
        v.id AS vehiculo_id,
        v.marca AS vehiculo_marca,
        v.modelo AS vehiculo_modelo,
        v.tipo AS vehiculo_tipo,
        v.ano AS vehiculo_ano,
        v.motor AS vehiculo_motor,
        v.inscripcion_inicial AS vehiculo_inscripcion_inicial,
        v.dominio AS vehiculo_dominio,
        hg.nro_licencia AS licencia_nro,
        hg.expte AS expediente_nro,
        hg.tipo_transporte,
        r.nombre AS nombre_remiseria,
        r.nro_expediente AS expte_remiseria,
        r.nro_habilitacion AS cuenta_remiseria,
        CONCAT(r.direccion, ', ', r.localidad) AS domicilio_remiseria
      FROM habilitaciones_generales hg
      LEFT JOIN habilitaciones_personas hp ON hg.id = hp.habilitacion_id AND hp.rol = 'TITULAR'
      LEFT JOIN personas p ON hp.persona_id = p.id
      LEFT JOIN habilitaciones_vehiculos hv ON hg.id = hv.habilitacion_id
      LEFT JOIN vehiculos v ON hv.vehiculo_id = v.id
      LEFT JOIN habilitaciones_establecimientos he ON hg.id = he.habilitacion_id AND he.tipo = 'remiseria'
      LEFT JOIN remiserias r ON he.establecimiento_id = r.id
      WHERE hg.id = ?
    `

    const result: any = await prisma.$queryRawUnsafe(sql, habilitacionId)

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    const data = result[0]

    // Validar datos requeridos
    const camposFaltantes: string[] = []

    if (!data.titular_dni) camposFaltantes.push('DNI del Titular')
    if (!data.domicilio_calle) camposFaltantes.push('Calle del Domicilio')
    if (!data.domicilio_localidad) camposFaltantes.push('Localidad')
    if (!data.vehiculo_dominio) camposFaltantes.push('Dominio del Vehículo')
    if (!data.vehiculo_marca) camposFaltantes.push('Marca del Vehículo')
    if (!data.vehiculo_modelo) camposFaltantes.push('Modelo del Vehículo')
    if (!data.vehiculo_ano) camposFaltantes.push('Año del Vehículo')
    if (!data.expediente_nro) camposFaltantes.push('Número de Expediente')
    if (!data.licencia_nro) camposFaltantes.push('Número de Licencia')

    if (camposFaltantes.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan datos requeridos',
          camposFaltantes,
          data,
        },
        { status: 400 }
      )
    }

    // Seleccionar plantilla según tipo
    const templateFileName =
      data.tipo_transporte === 'Escolar'
        ? 'resolucion_escolar_template.docx'
        : 'resolucion_remis_template.docx'

    const templatePath = path.join(process.cwd(), 'public', 'plantillas', templateFileName)

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { success: false, error: `Plantilla no encontrada: ${templateFileName}` },
        { status: 500 }
      )
    }

    // Cargar plantilla
    const content = fs.readFileSync(templatePath, 'binary')
    const zip = new PizZip(content)
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })

    // Lógica de género
    let tratamiento = 'el Señor'
    let propiedad_de = 'del Señor'
    let domiciliada = 'domiciliado'

    if (data.genero) {
      const generoLower = data.genero.toLowerCase()
      if (generoLower === 'femenino' || generoLower.startsWith('f')) {
        tratamiento = 'la Señora'
        propiedad_de = 'de la Señora'
        domiciliada = 'domiciliada'
      }
    }

    // Preparar datos
    const domicilioCompleto = `${data.domicilio_calle || ''} ${data.domicilio_nro || ''}`.trim()
    const resolucionNro = String(habilitacionId).padStart(4, '0') + '/' + new Date().getFullYear()

    // Fecha larga en español
    const meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ]
    const fecha = new Date()
    const fechaLarga = `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`

    // Formatear DNI con puntos
    const dniFormateado = data.titular_dni ? Number(data.titular_dni).toLocaleString('es-AR') : ''

    // Asignar valores a la plantilla
    doc.setData({
      fecha_larga: fechaLarga,
      resolucion_nro: resolucionNro,
      expediente_nro: data.expediente_nro || '',
      tratamiento,
      propiedad_de,
      domiciliada,
      titular_nombre: data.titular_nombre || '',
      titular_dni: dniFormateado,
      titular_domicilio_calle: domicilioCompleto,
      titular_domicilio_localidad: data.domicilio_localidad || '',
      licencia_nro: data.licencia_nro || '',
      vehiculo_marca: data.vehiculo_marca || '',
      vehiculo_modelo: data.vehiculo_modelo || '',
      vehiculo_anho: data.vehiculo_ano || '',
      vehiculo_dominio: data.vehiculo_dominio || '',
      vehiculo_tipo: data.vehiculo_tipo || '',
      vehiculo_inscripcion_inicial: data.vehiculo_inscripcion_inicial
        ? new Date(data.vehiculo_inscripcion_inicial).toLocaleDateString('es-AR')
        : '',
      vehiculo_motor: data.vehiculo_motor || '',
      // Datos específicos de Remis
      expte_remiseria: data.expte_remiseria || '',
      cuenta_remiseria: data.cuenta_remiseria || '',
      nombre_remiseria: data.nombre_remiseria || '',
      domicilio_remiseria: data.domicilio_remiseria || '',
    })

    // Renderizar documento
    doc.render()

    // Generar buffer
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    })

    // Nombre del archivo
    const fileName = `Resolucion-${data.licencia_nro?.replace(/[^a-zA-Z0-9-]/g, '_')}.docx`

    // Retornar el documento
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('Error al generar resolución:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al generar resolución',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
