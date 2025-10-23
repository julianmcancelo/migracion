const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando variables de entorno...\n')

// Variables requeridas
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
]

// Verificar archivo .env
const envPath = path.join(__dirname, '..', '.env')
const envExamplePath = path.join(__dirname, '..', '.env.example')

if (!fs.existsSync(envPath)) {
  console.log('❌ Archivo .env no encontrado')
  console.log('📋 Copia .env.example a .env y configura las variables\n')

  if (fs.existsSync(envExamplePath)) {
    console.log('✅ Archivo .env.example encontrado')
    console.log('💡 Ejecuta: cp .env.example .env\n')
  }

  process.exit(1)
}

// Cargar variables
require('dotenv').config({ path: envPath })

console.log('📊 Estado de variables de entorno:\n')

let allGood = true

requiredVars.forEach(varName => {
  const value = process.env[varName]

  if (!value) {
    console.log(`❌ ${varName}: No configurada`)
    allGood = false
  } else if (value.includes('tu-') || value.includes('cambiar')) {
    console.log(`⚠️  ${varName}: Usar valor por defecto (cambiar en producción)`)
    console.log(`   Valor actual: ${value.substring(0, 20)}...`)
  } else {
    console.log(`✅ ${varName}: Configurada`)
  }
})

console.log('\n' + '='.repeat(50))

if (allGood) {
  console.log('✅ Todas las variables están configuradas')
  console.log('🚀 La aplicación debería funcionar correctamente')
} else {
  console.log('❌ Faltan variables por configurar')
  console.log('📝 Revisa el archivo .env y completa las variables faltantes')
}

console.log('\n💡 Para URLs en emails, verifica que NEXT_PUBLIC_APP_URL esté correcta:')
console.log(`   Actual: ${process.env.NEXT_PUBLIC_APP_URL || 'NO CONFIGURADA'}`)
console.log('   Producción: https://tu-dominio.com')
console.log('   Desarrollo: http://localhost:3000')

console.log('\n🔗 Variables de URL encontradas:')
if (process.env.NEXT_PUBLIC_APP_URL) {
  console.log(`   NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`)
}
if (process.env.NEXT_PUBLIC_URL) {
  console.log(`   NEXT_PUBLIC_URL: ${process.env.NEXT_PUBLIC_URL}`)
}

console.log('\n📧 Para probar emails con enlaces:')
console.log('1. Configura NEXT_PUBLIC_APP_URL con tu URL real')
console.log('2. Reinicia el servidor de desarrollo')
console.log('3. Envía un recordatorio de turno')
console.log('4. Verifica que los enlaces en el email sean correctos')
