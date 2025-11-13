/**
 * Script para actualizar DATABASE_URL en .env.local
 * Cambia de localhost al servidor remoto
 */

const fs = require('fs')
const path = require('path')

console.log('\n🔧 ACTUALIZANDO DATABASE_URL\n')
console.log('═'.repeat(60))

const envPath = path.join(__dirname, '..', '.env.local')

if (!fs.existsSync(envPath)) {
  console.log('❌ ERROR: No se encontró el archivo .env.local')
  process.exit(1)
}

// URL correcta de la base de datos remota
const correctDatabaseUrl = 'mysql://transpo1_credenciales:feelthesky1@167.250.5.55:3306/transpo1_credenciales'

try {
  // Leer archivo actual
  let envContent = fs.readFileSync(envPath, 'utf-8')
  
  console.log('\n📝 Analizando configuración actual...')
  
  // Verificar URL actual
  const currentUrlMatch = envContent.match(/DATABASE_URL\s*=\s*["']([^"']+)["']/)
  if (currentUrlMatch) {
    const currentUrl = currentUrlMatch[1]
    console.log('   URL actual: ' + currentUrl)
    
    if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
      console.log('   ❌ Apunta a localhost (incorrecto)')
    } else if (currentUrl.includes('167.250.5.55')) {
      console.log('   ✅ Ya apunta al servidor remoto')
      console.log('\n✅ No se necesitan cambios')
      process.exit(0)
    }
  }
  
  // Crear backup
  const backupPath = envPath + '.backup'
  fs.writeFileSync(backupPath, envContent)
  console.log('\n✅ Backup creado: .env.local.backup')
  
  // Reemplazar DATABASE_URL
  const lines = envContent.split('\n')
  let updated = false
  
  const newLines = lines.map(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('DATABASE_URL=')) {
      updated = true
      return `DATABASE_URL="${correctDatabaseUrl}"`
    }
    return line
  })
  
  // Si no existía DATABASE_URL, agregarlo al inicio
  if (!updated) {
    newLines.unshift(
      `# Base de datos MySQL - PRODUCCIÓN REMOTA`,
      `DATABASE_URL="${correctDatabaseUrl}"`,
      ''
    )
    console.log('✅ DATABASE_URL agregado al archivo')
  } else {
    console.log('✅ DATABASE_URL actualizado en el archivo')
  }
  
  // Guardar archivo actualizado
  fs.writeFileSync(envPath, newLines.join('\n'))
  
  console.log('\n📊 Nueva configuración:')
  console.log('   Host: 167.250.5.55')
  console.log('   Base de datos: transpo1_credenciales')
  console.log('   Usuario: transpo1_credenciales')
  
  console.log('\n═'.repeat(60))
  console.log('\n✅ ¡ACTUALIZACIÓN COMPLETADA!\n')
  console.log('📝 PRÓXIMOS PASOS:\n')
  console.log('   1. Reinicia el servidor de desarrollo:')
  console.log('      Ctrl+C (para detener)')
  console.log('      npm run dev (para iniciar)\n')
  console.log('   2. Intenta iniciar sesión nuevamente\n')
  console.log('⚠️  IMPORTANTE: Asegúrate de que el servidor MySQL')
  console.log('   en 167.250.5.55 esté accesible desde tu red.\n')
  
} catch (error) {
  console.log('❌ ERROR:', error.message)
  process.exit(1)
}
