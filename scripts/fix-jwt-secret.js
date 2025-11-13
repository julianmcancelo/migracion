/**
 * Script para actualizar JWT_SECRET en .env.local
 * Genera un secret seguro y actualiza el archivo automáticamente
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

console.log('\n🔧 REPARANDO JWT_SECRET\n')
console.log('═'.repeat(60))

// Generar un JWT_SECRET seguro
function generateSecureSecret() {
  return crypto.randomBytes(48).toString('base64')
}

const envPath = path.join(__dirname, '..', '.env.local')

if (!fs.existsSync(envPath)) {
  console.log('❌ ERROR: No se encontró el archivo .env.local')
  console.log('\n   Crea primero el archivo .env.local basándote en .env.example')
  process.exit(1)
}

try {
  // Leer archivo actual
  let envContent = fs.readFileSync(envPath, 'utf-8')
  
  // Generar nuevo secret
  const newSecret = generateSecureSecret()
  
  console.log('\n✨ Nuevo JWT_SECRET generado:')
  console.log('   ' + newSecret)
  console.log('')
  
  // Crear backup
  const backupPath = envPath + '.backup'
  fs.writeFileSync(backupPath, envContent)
  console.log('✅ Backup creado: .env.local.backup')
  
  // Reemplazar JWT_SECRET
  let updated = false
  const lines = envContent.split('\n')
  const newLines = lines.map(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('JWT_SECRET=')) {
      updated = true
      return `JWT_SECRET="${newSecret}"`
    }
    return line
  })
  
  // Si no existía JWT_SECRET, agregarlo después de DATABASE_URL
  if (!updated) {
    const dbUrlIndex = newLines.findIndex(line => line.trim().startsWith('DATABASE_URL='))
    if (dbUrlIndex !== -1) {
      newLines.splice(dbUrlIndex + 1, 0, '', `# JWT Secret (generado automáticamente)`, `JWT_SECRET="${newSecret}"`)
    } else {
      newLines.push('', `# JWT Secret (generado automáticamente)`, `JWT_SECRET="${newSecret}"`)
    }
    console.log('✅ JWT_SECRET agregado al archivo')
  } else {
    console.log('✅ JWT_SECRET actualizado en el archivo')
  }
  
  // Guardar archivo actualizado
  fs.writeFileSync(envPath, newLines.join('\n'))
  
  console.log('\n═'.repeat(60))
  console.log('\n✅ ¡REPARACIÓN COMPLETADA!\n')
  console.log('📝 PRÓXIMOS PASOS:\n')
  console.log('   1. Reinicia el servidor de desarrollo:')
  console.log('      Ctrl+C (para detener)')
  console.log('      npm run dev (para iniciar)\n')
  console.log('   2. Limpia las cookies del navegador:')
  console.log('      - Presiona F12')
  console.log('      - Ve a Application > Cookies')
  console.log('      - Elimina la cookie "session"\n')
  console.log('   3. Intenta iniciar sesión nuevamente\n')
  
} catch (error) {
  console.log('❌ ERROR:', error.message)
  process.exit(1)
}
