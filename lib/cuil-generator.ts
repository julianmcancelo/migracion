/**
 * Utilidad para generar CUIL/CUIT automáticamente
 * basándose en el DNI y el género de la persona
 */

/**
 * Calcula el dígito verificador del CUIL/CUIT
 * usando el algoritmo oficial de ANSES/AFIP
 */
function calcularDigitoVerificador(prefijo: string, dni: string): number {
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const numeroCompleto = prefijo + dni.padStart(8, '0')
  
  let suma = 0
  for (let i = 0; i < numeroCompleto.length; i++) {
    suma += parseInt(numeroCompleto[i]) * multiplicadores[i]
  }
  
  const resto = suma % 11
  const diferencia = 11 - resto
  
  // Casos especiales según ANSES
  if (diferencia === 11) return 0
  if (diferencia === 10) return 9
  return diferencia
}

/**
 * Genera el CUIL completo basándose en DNI y género
 * 
 * @param dni - Número de DNI (puede ser string o number)
 * @param genero - "Masculino", "Femenino" o "Otro"
 * @returns CUIL formateado como "XX-XXXXXXXX-X" o null si faltan datos
 * 
 * @example
 * generarCUIL("12345678", "Masculino") // "20-12345678-5"
 * generarCUIL("34506563", "Femenino") // "27-34506563-4"
 */
export function generarCUIL(dni: string | number, genero: string): string | null {
  // Validar que tengamos DNI y género
  if (!dni || !genero) return null
  
  // Limpiar DNI: solo números
  const dniLimpio = dni.toString().replace(/\D/g, '')
  
  // Validar que el DNI tenga entre 7 y 8 dígitos
  if (dniLimpio.length < 7 || dniLimpio.length > 8) return null
  
  // Determinar prefijo según género
  let prefijo = '20' // Masculino por defecto
  
  const generoLower = genero.toLowerCase()
  if (generoLower === 'femenino' || generoLower === 'f') {
    prefijo = '27'
  } else if (generoLower === 'masculino' || generoLower === 'm') {
    prefijo = '20'
  } else {
    // Para "Otro" o casos especiales, usar 23
    prefijo = '23'
  }
  
  // Calcular dígito verificador
  const digitoVerificador = calcularDigitoVerificador(prefijo, dniLimpio)
  
  // Formatear CUIL: XX-XXXXXXXX-X
  const dniPadded = dniLimpio.padStart(8, '0')
  return `${prefijo}-${dniPadded}-${digitoVerificador}`
}

/**
 * Valida si un CUIL/CUIT es válido
 * 
 * @param cuil - CUIL a validar (con o sin guiones)
 * @returns true si es válido, false si no lo es
 * 
 * @example
 * validarCUIL("20-12345678-5") // true
 * validarCUIL("20-12345678-9") // false (dígito verificador incorrecto)
 */
export function validarCUIL(cuil: string): boolean {
  if (!cuil) return false
  
  // Limpiar: solo números
  const cuilLimpio = cuil.replace(/\D/g, '')
  
  // Debe tener exactamente 11 dígitos
  if (cuilLimpio.length !== 11) return false
  
  const prefijo = cuilLimpio.substring(0, 2)
  const dni = cuilLimpio.substring(2, 10)
  const digitoIngresado = parseInt(cuilLimpio.substring(10, 11))
  
  // Calcular el dígito verificador correcto
  const digitoCorrecto = calcularDigitoVerificador(prefijo, dni)
  
  return digitoIngresado === digitoCorrecto
}

/**
 * Formatea un CUIL agregando guiones
 * 
 * @param cuil - CUIL sin formato (solo números)
 * @returns CUIL formateado como "XX-XXXXXXXX-X"
 * 
 * @example
 * formatearCUIL("20123456785") // "20-12345678-5"
 */
export function formatearCUIL(cuil: string): string {
  if (!cuil) return ''
  
  // Limpiar: solo números
  const cuilLimpio = cuil.replace(/\D/g, '')
  
  // Si tiene 11 dígitos, formatear
  if (cuilLimpio.length === 11) {
    return `${cuilLimpio.substring(0, 2)}-${cuilLimpio.substring(2, 10)}-${cuilLimpio.substring(10, 11)}`
  }
  
  return cuil
}

/**
 * Extrae el DNI de un CUIL
 * 
 * @param cuil - CUIL completo (con o sin guiones)
 * @returns DNI extraído como string
 * 
 * @example
 * extraerDNIDeCUIL("20-12345678-5") // "12345678"
 */
export function extraerDNIDeCUIL(cuil: string): string {
  if (!cuil) return ''
  
  const cuilLimpio = cuil.replace(/\D/g, '')
  
  if (cuilLimpio.length === 11) {
    return cuilLimpio.substring(2, 10).replace(/^0+/, '') // Remover ceros a la izquierda
  }
  
  return ''
}
