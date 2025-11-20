#!/usr/bin/env node

/**
 * 🔐 GENERADOR DE SECRETOS SEGUROS
 * 
 * Este script genera credenciales seguras para el sistema.
 * Ejecutar: node scripts/generate-secrets.js
 */

const crypto = require('crypto')

console.log('\n🔐 GENERADOR DE SECRETOS SEGUROS\n')
console.log('=' .repeat(60))
console.log('\n⚠️  IMPORTANTE: Guarda estos valores en tu archivo .env')
console.log('⚠️  NUNCA los compartas públicamente o los commitees a Git\n')
console.log('=' .repeat(60))

// JWT Secret (64 bytes = 512 bits)
const jwtSecret = crypto.randomBytes(64).toString('base64')
console.log('\n📝 JWT_SECRET (para autenticación):')
console.log(`JWT_SECRET="${jwtSecret}"`)

// Encryption Key (32 bytes = 256 bits para AES-256)
const encryptionKey = crypto.randomBytes(32).toString('hex')
console.log('\n🔒 ENCRYPTION_KEY (para encriptar datos sensibles):')
console.log(`ENCRYPTION_KEY="${encryptionKey}"`)

// Session Secret
const sessionSecret = crypto.randomBytes(32).toString('hex')
console.log('\n🎫 SESSION_SECRET (para sesiones):')
console.log(`SESSION_SECRET="${sessionSecret}"`)

// API Token para webhooks/integraciones
const apiToken = crypto.randomBytes(32).toString('hex')
console.log('\n🔑 API_TOKEN (para integraciones):')
console.log(`API_TOKEN="${apiToken}"`)

console.log('\n' + '='.repeat(60))
console.log('\n✅ Secretos generados exitosamente!')
console.log('\n📋 Próximos pasos:')
console.log('   1. Copia estos valores a tu archivo .env')
console.log('   2. Verifica que .env está en .gitignore')
console.log('   3. Configura las mismas variables en tu servidor de producción')
console.log('   4. NUNCA compartas estos valores\n')

// Generar contraseña de ejemplo para MySQL
console.log('=' .repeat(60))
console.log('\n💾 CONTRASEÑA SUGERIDA PARA MYSQL:')
const mysqlPassword = crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '')
console.log(`   ${mysqlPassword}`)
console.log('\n⚠️  Recuerda cambiar la contraseña de MySQL en producción\n')

// Información adicional
console.log('=' .repeat(60))
console.log('\n📚 RECURSOS ADICIONALES:\n')
console.log('   • Documentación de seguridad: AUDITORIA_SEGURIDAD.md')
console.log('   • Configurar Google Maps API: https://console.cloud.google.com/')
console.log('   • Configurar Gemini API: https://aistudio.google.com/app/apikey')
console.log('   • Configurar Gmail App Password: https://myaccount.google.com/apppasswords')
console.log('\n' + '='.repeat(60) + '\n')
