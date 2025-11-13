/**
 * Script de diagnóstico para problemas de login
 * Verifica configuración de JWT_SECRET y variables de entorno
 */

const fs = require('fs')
const path = require('path')

console.log('\n🔍 DIAGNÓSTICO DE LOGIN - Sistema de Credenciales\n')
console.log('═'.repeat(60))

// Verificar archivo .env.local
const envPath = path.join(__dirname, '..', '.env.local')
const envExists = fs.existsSync(envPath)

console.log('\n1️⃣ Verificando archivo .env.local...')
if (!envExists) {
  console.log('❌ ERROR: No existe el archivo .env.local')
  console.log('\n📝 SOLUCIÓN:')
  console.log('   Crea el archivo .env.local con este contenido:')
  console.log('\n   DATABASE_URL="mysql://usuario:password@host:3306/database"')
  console.log('   JWT_SECRET="' + generateSecret() + '"')
  console.log('\n   (Reemplaza usuario, password, host y database con tus datos)')
  process.exit(1)
} else {
  console.log('✅ Archivo .env.local existe')
}

// Leer y verificar variables
console.log('\n2️⃣ Verificando variables de entorno...')
try {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')
  
  let hasJwtSecret = false
  let hasDatabaseUrl = false
  let jwtSecretValue = ''
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('JWT_SECRET=')) {
      hasJwtSecret = true
      jwtSecretValue = trimmed.split('=')[1].replace(/['"]/g, '')
    }
    if (trimmed.startsWith('DATABASE_URL=')) {
      hasDatabaseUrl = true
    }
  })
  
  // Verificar JWT_SECRET
  if (!hasJwtSecret) {
    console.log('❌ ERROR: Falta la variable JWT_SECRET')
    console.log('\n📝 SOLUCIÓN:')
    console.log('   Agrega esta línea a tu .env.local:')
    console.log('   JWT_SECRET="' + generateSecret() + '"')
    process.exit(1)
  } else if (jwtSecretValue.includes('tu_secreto') || jwtSecretValue.includes('cambiar') || jwtSecretValue.length < 20) {
    console.log('⚠️  ADVERTENCIA: JWT_SECRET parece ser un valor de ejemplo')
    console.log('   Valor actual: ' + jwtSecretValue.substring(0, 20) + '...')
    console.log('\n📝 SOLUCIÓN:')
    console.log('   Reemplaza JWT_SECRET con este valor único:')
    console.log('   JWT_SECRET="' + generateSecret() + '"')
    console.log('')
  } else {
    console.log('✅ JWT_SECRET configurado correctamente')
    console.log('   Longitud: ' + jwtSecretValue.length + ' caracteres')
  }
  
  // Verificar DATABASE_URL
  if (!hasDatabaseUrl) {
    console.log('❌ ERROR: Falta la variable DATABASE_URL')
    console.log('\n📝 SOLUCIÓN:')
    console.log('   Agrega tu conexión a MySQL en .env.local:')
    console.log('   DATABASE_URL="mysql://usuario:password@host:3306/database"')
    process.exit(1)
  } else {
    console.log('✅ DATABASE_URL configurado')
  }
  
} catch (error) {
  console.log('❌ ERROR leyendo .env.local:', error.message)
  process.exit(1)
}

// Verificar archivos críticos
console.log('\n3️⃣ Verificando archivos del sistema de autenticación...')
const criticalFiles = [
  'lib/auth.ts',
  'middleware.ts',
  'app/api/auth/login/route.ts',
]

let allFilesExist = true
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`)
  } else {
    console.log(`   ❌ ${file} - NO ENCONTRADO`)
    allFilesExist = false
  }
})

if (!allFilesExist) {
  console.log('\n❌ Faltan archivos críticos del sistema')
  process.exit(1)
}

// Recomendaciones
console.log('\n4️⃣ Verificación de cookies en producción...')
console.log('   ⚠️  En desarrollo: secure=false es correcto')
console.log('   ⚠️  En producción: secure=true (automático con HTTPS)')

console.log('\n═'.repeat(60))
console.log('\n✅ DIAGNÓSTICO COMPLETADO\n')

console.log('🔧 PASOS SIGUIENTES:')
console.log('   1. Si modificaste .env.local, reinicia el servidor:')
console.log('      npm run dev')
console.log('')
console.log('   2. Limpia las cookies del navegador:')
console.log('      - Chrome: F12 > Application > Cookies > localhost')
console.log('      - Elimina la cookie "session"')
console.log('')
console.log('   3. Intenta iniciar sesión nuevamente')
console.log('')

// Función auxiliar para generar un secret seguro
function generateSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let secret = ''
  for (let i = 0; i < 64; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}
