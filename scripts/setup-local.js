#!/usr/bin/env node

/**
 * Script para configurar el entorno local
 * - Regenera Prisma Client
 * - Verifica conexión a BD
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Configurando entorno local...\n')

// 1. Verificar que existe .env
const envPath = path.join(__dirname, '..', '.env')
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: No se encuentra el archivo .env')
  console.log('💡 Copia .env.example a .env y configura tus variables')
  process.exit(1)
}

console.log('✅ Archivo .env encontrado')

// 2. Limpiar cache de Prisma
console.log('\n🧹 Limpiando cache de Prisma...')
try {
  const prismaPath = path.join(__dirname, '..', 'node_modules', '.prisma')
  if (fs.existsSync(prismaPath)) {
    fs.rmSync(prismaPath, { recursive: true, force: true })
    console.log('✅ Cache limpiado')
  }
} catch (error) {
  console.log('⚠️  No se pudo limpiar cache (puede ser normal)')
}

// 3. Regenerar Prisma Client
console.log('\n🔄 Regenerando Prisma Client...')
try {
  execSync('npx prisma generate', { stdio: 'inherit' })
  console.log('✅ Prisma Client regenerado')
} catch (error) {
  console.error('❌ Error al regenerar Prisma Client')
  process.exit(1)
}

// 4. Verificar conexión a BD
console.log('\n🔌 Verificando conexión a base de datos...')
try {
  execSync('node scripts/test-db-connection.js', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ Error de conexión a base de datos')
  process.exit(1)
}

console.log('\n✅ ¡Todo listo! Puedes ejecutar: npm run dev')
