/**
 * Script de migración de paradas desde el sistema PHP antiguo
 * Lee el archivo points.json y migra los datos a la nueva base de datos
 * 
 * Uso: node scripts/migrate-paradas.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Mapeo de tipos antiguos a nuevos
const TIPO_MAPPING = {
  'seguridad': 'seguridad',
  'transporte': 'transporte',
  'semaforo': 'semaforo',
  'salud': 'salud',
  'educacion': 'educacion',
  'municipal': 'municipal',
}

// Mapeo de estados
const ESTADO_MAPPING = {
  'ok': 'ok',
  'falla': 'falla',
  'mantenimiento': 'mantenimiento',
}

async function migrarParadas() {
  try {
    console.log('🚀 Iniciando migración de paradas...\n')

    // Leer archivo JSON del sistema antiguo
    const jsonPath = path.join(process.cwd(), 'paradas', 'points.json')
    
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ Error: No se encontró el archivo points.json en la carpeta paradas/')
      console.log('   Ubicación esperada:', jsonPath)
      return
    }

    const jsonData = fs.readFileSync(jsonPath, 'utf8')
    const pointsData = JSON.parse(jsonData)

    console.log(`📊 Se encontraron ${pointsData.length} puntos en el archivo JSON\n`)

    // Validar y limpiar datos
    const validPoints = pointsData
      .filter(point => {
        const isValid = point.title && point.type && point.lat && point.lng
        if (!isValid) {
          console.warn(`⚠️  Punto inválido ignorado:`, point.title || 'Sin título')
        }
        return isValid
      })
      .map(point => ({
        titulo: point.title.trim(),
        tipo: TIPO_MAPPING[point.type] || 'municipal',
        descripcion: point.description?.trim() || null,
        latitud: parseFloat(point.lat),
        longitud: parseFloat(point.lng),
        estado: ESTADO_MAPPING[point.status] || 'ok',
        activo: true,
      }))

    console.log(`✅ ${validPoints.length} puntos válidos para migrar\n`)

    // Verificar si ya existen paradas en la BD
    const existingCount = await prisma.paradas.count()
    
    if (existingCount > 0) {
      console.log(`⚠️  Ya existen ${existingCount} paradas en la base de datos`)
      console.log('   ¿Desea continuar con la migración? Esto agregará los puntos del JSON.')
      console.log('   Presione Ctrl+C para cancelar, o Enter para continuar...')
      
      // Esperar confirmación (solo en modo interactivo)
      if (process.stdin.isTTY) {
        await new Promise(resolve => {
          process.stdin.once('data', resolve)
        })
      }
    }

    // Insertar datos en la BD
    console.log('\n📝 Insertando datos en la base de datos...\n')
    
    let successCount = 0
    let errorCount = 0

    for (const point of validPoints) {
      try {
        await prisma.paradas.create({
          data: point
        })
        successCount++
        console.log(`  ✓ ${point.titulo} (${point.tipo})`)
      } catch (error) {
        errorCount++
        console.error(`  ✗ Error al insertar "${point.titulo}":`, error.message)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Resumen de la migración:')
    console.log('='.repeat(60))
    console.log(`✅ Exitosos: ${successCount}`)
    console.log(`❌ Errores: ${errorCount}`)
    console.log(`📍 Total en BD: ${await prisma.paradas.count()}`)
    console.log('='.repeat(60))
    
    if (successCount > 0) {
      console.log('\n🎉 Migración completada exitosamente!')
      console.log('   Puedes acceder al sistema en: http://localhost:3000/paradas')
    }

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar migración
migrarParadas()
  .catch(console.error)
