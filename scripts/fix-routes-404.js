/**
 * Script para solucionar errores 404 en rutas API
 * Limpia el caché de Next.js y verifica configuración
 */

const fs = require('fs')
const path = require('path')

console.log('\n🔧 SOLUCIONANDO ERROR 404 EN RUTAS API\n')
console.log('═'.repeat(60))

// Verificar que la ruta existe
const routePath = path.join(__dirname, '..', 'app', 'api', 'paradas', 'geocode-single', 'route.ts')
console.log('\n1️⃣ Verificando ruta API...')
if (fs.existsSync(routePath)) {
  console.log('✅ Archivo encontrado: app/api/paradas/geocode-single/route.ts')
} else {
  console.log('❌ ERROR: El archivo de ruta no existe')
  process.exit(1)
}

// Verificar GOOGLE_MAPS_API_KEY
console.log('\n2️⃣ Verificando GOOGLE_MAPS_API_KEY...')
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  if (envContent.includes('GOOGLE_MAPS_API_KEY=')) {
    console.log('✅ GOOGLE_MAPS_API_KEY configurada')
  } else {
    console.log('⚠️  ADVERTENCIA: GOOGLE_MAPS_API_KEY no encontrada en .env.local')
    console.log('   Esta clave es necesaria para la geocodificación')
    console.log('\n   Agrega esta línea a tu .env.local:')
    console.log('   GOOGLE_MAPS_API_KEY="tu_api_key_aqui"')
  }
} else {
  console.log('⚠️  Archivo .env.local no encontrado')
}

// Verificar caché de Next.js
console.log('\n3️⃣ Verificando caché de Next.js...')
const nextCachePath = path.join(__dirname, '..', '.next')
if (fs.existsSync(nextCachePath)) {
  console.log('✅ Carpeta .next encontrada')
  console.log('   Recomendación: Eliminar para limpiar caché')
} else {
  console.log('ℹ️  No hay caché de Next.js')
}

console.log('\n═'.repeat(60))
console.log('\n📝 SOLUCIONES RECOMENDADAS:\n')

console.log('1️⃣ Limpiar caché y reiniciar servidor:')
console.log('   Opción A (Windows PowerShell):')
console.log('   Remove-Item -Recurse -Force .next')
console.log('   npm run dev')
console.log('')
console.log('   Opción B (comando simple):')
console.log('   npm run build')
console.log('   npm run dev')
console.log('')

console.log('2️⃣ Si el problema persiste, hacer "Hard Refresh" en el navegador:')
console.log('   - Chrome/Edge: Ctrl + Shift + R')
console.log('   - Firefox: Ctrl + F5')
console.log('')

console.log('3️⃣ Verificar que GOOGLE_MAPS_API_KEY esté configurada:')
console.log('   - Abre .env.local')
console.log('   - Asegúrate de tener: GOOGLE_MAPS_API_KEY="tu_api_key"')
console.log('')

console.log('4️⃣ Si usas la funcionalidad de paradas, necesitas:')
console.log('   - Obtener una API Key de Google Maps en:')
console.log('   - https://console.cloud.google.com/')
console.log('   - Habilitar "Geocoding API"')
console.log('')
