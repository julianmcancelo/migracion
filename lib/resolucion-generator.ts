import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import * as fs from 'fs'
import * as path from 'path'

interface DatosResolucion {
  // Datos generales
  fecha_larga: string
  resolucion_nro: string
  expediente_nro: string
  licencia_nro: string
  
  // Datos del titular
  tratamiento: string // "el Señor" / "la Señora"
  propiedad_de: string // "del Señor" / "de la Señora"
  domiciliada: string // "domiciliado" / "domiciliada"
  titular_nombre: string
  titular_dni: string
  titular_domicilio_calle: string
  titular_domicilio_localidad: string
  
  // Datos del vehículo
  vehiculo_marca: string
  vehiculo_modelo: string
  vehiculo_anho: string
  vehiculo_dominio: string
  vehiculo_tipo: string
  vehiculo_inscripcion_inicial: string
  vehiculo_motor: string
  
  // Datos de remisería (solo para remis)
  expte_remiseria?: string
  cuenta_remiseria?: string
  nombre_remiseria?: string
  domicilio_remiseria?: string
}

/**
 * Genera un documento Word (.docx) de resolución
 * a partir de una plantilla con placeholders
 */
export async function generarResolucion(
  tipoTransporte: 'Escolar' | 'Remis',
  datos: DatosResolucion
): Promise<Buffer> {
  try {
    // Seleccionar plantilla según tipo
    const templateName = tipoTransporte === 'Escolar' 
      ? 'resolucion_escolar_template.docx'
      : 'resolucion_remis_template.docx'
    
    const templatePath = path.join(process.cwd(), 'plantillas', templateName)
    
    // Verificar que existe la plantilla
    if (!fs.existsSync(templatePath)) {
      throw new Error(`No se encontró la plantilla: ${templatePath}`)
    }
    
    // Leer el archivo de plantilla
    const content = fs.readFileSync(templatePath, 'binary')
    
    // Crear instancia de PizZip
    const zip = new PizZip(content)
    
    // Crear instancia de Docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })
    
    // Asignar valores a los placeholders
    doc.render(datos)
    
    // Generar el documento
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    })
    
    return buffer
    
  } catch (error) {
    console.error('Error al generar resolución:', error)
    throw new Error(`Error al generar resolución: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}

/**
 * Genera el número de resolución automático
 * Formato: ID_HABILITACION_PADDED/AÑO
 * Ejemplo: 0012/24
 */
export function generarNumeroResolucion(habilitacionId: number): string {
  const idPadded = habilitacionId.toString().padStart(4, '0')
  const año = new Date().getFullYear().toString().slice(-2)
  return `${idPadded}/${año}`
}

/**
 * Formatea una fecha en español largo
 * Ejemplo: "23 de Octubre de 2024"
 */
export function formatearFechaLarga(fecha: Date = new Date()): string {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  
  const dia = fecha.getDate()
  const mes = meses[fecha.getMonth()]
  const año = fecha.getFullYear()
  
  return `${dia} de ${mes} de ${año}`
}

/**
 * Determina el tratamiento de género
 * Retorna objeto con todas las variaciones de género
 */
export function determinarGenero(genero?: string | null): {
  tratamiento: string
  propiedad_de: string
  domiciliada: string
} {
  const esFemenino = genero && genero.toLowerCase().startsWith('f')
  
  return {
    tratamiento: esFemenino ? 'la Señora' : 'el Señor',
    propiedad_de: esFemenino ? 'de la Señora' : 'del Señor',
    domiciliada: esFemenino ? 'domiciliada' : 'domiciliado',
  }
}

/**
 * Formatea un DNI con puntos
 * Ejemplo: 34506563 → "34.506.563"
 */
export function formatearDNI(dni: string | number): string {
  const dniStr = dni.toString().replace(/\D/g, '')
  return dniStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Valida que todos los campos requeridos estén presentes
 */
export function validarDatosRequeridos(datos: any): string[] {
  const camposRequeridos = [
    'titular_dni',
    'domicilio_calle',
    'domicilio_localidad',
    'vehiculo_dominio',
    'vehiculo_marca',
    'vehiculo_modelo',
    'vehiculo_ano',
    'expediente_nro',
    'licencia_nro',
  ]
  
  const faltantes: string[] = []
  
  for (const campo of camposRequeridos) {
    if (!datos[campo] || String(datos[campo]).trim() === '') {
      faltantes.push(campo)
    }
  }
  
  return faltantes
}
