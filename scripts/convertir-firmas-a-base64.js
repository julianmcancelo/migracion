/**
 * Script para convertir firmas y fotos de obleas a base64
 * 
 * Este script lee las imágenes desde el sistema de archivos
 * y las convierte a base64 para guardarlas en la BD.
 * 
 * Uso: node scripts/convertir-firmas-a-base64.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Configuración
const DRY_RUN = false // Cambiar a false para aplicar cambios reales

async function convertirImagenABase64(filePath) {
  try {
    // Intentar leer el archivo
    let buffer
    
    // Si el path comienza con /, intentar desde la raíz
    if (filePath.startsWith('/')) {
      try {
        buffer = fs.readFileSync(filePath)
      } catch (err) {
        // Si falla, intentar desde public/
        const publicPath = path.join(process.cwd(), 'public', filePath)
        buffer = fs.readFileSync(publicPath)
      }
    } else {
      buffer = fs.readFileSync(filePath)
    }
    
    // Determinar tipo de imagen
    const ext = path.extname(filePath).toLowerCase()
    let mimeType = 'image/jpeg'
    
    if (ext === '.png') mimeType = 'image/png'
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg'
    else if (ext === '.gif') mimeType = 'image/gif'
    else if (ext === '.webp') mimeType = 'image/webp'
    
    const base64 = buffer.toString('base64')
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error(`   ❌ Error leyendo ${filePath}: ${error.message}`)
    return null
  }
}

async function convertirObleas() {
  console.log('🚀 Iniciando conversión de firmas y fotos a base64...\n')
  
  if (DRY_RUN) {
    console.log('⚠️  MODO DRY RUN - No se aplicarán cambios\n')
  }
  
  try {
    // Obtener todas las obleas
    const obleas = await prisma.obleas.findMany({
      orderBy: { id: 'asc' }
    })
    
    console.log(`📋 Total de obleas encontradas: ${obleas.length}\n`)
    
    let convertidas = 0
    let errores = 0
    let yaConvertidas = 0
    
    for (const oblea of obleas) {
      console.log(`\n🔄 Procesando Oblea ID: ${oblea.id}`)
      console.log(`   Licencia: ${oblea.nro_licencia}`)
      
      const actualizaciones = {}
      let necesitaActualizacion = false
      
      // 1. Convertir firma del receptor
      if (oblea.path_firma_receptor) {
        if (oblea.path_firma_receptor.startsWith('data:image')) {
          console.log('   ✅ Firma receptor ya está en base64')
          yaConvertidas++
        } else {
          console.log(`   📄 Firma receptor: ${oblea.path_firma_receptor.substring(0, 50)}...`)
          const base64 = await convertirImagenABase64(oblea.path_firma_receptor)
          
          if (base64) {
            actualizaciones.path_firma_receptor = base64
            necesitaActualizacion = true
            console.log('   ✅ Firma receptor convertida')
          } else {
            errores++
          }
        }
      } else {
        console.log('   ⚪ No tiene firma receptor')
      }
      
      // 2. Convertir firma del inspector
      if (oblea.path_firma_inspector) {
        if (oblea.path_firma_inspector.startsWith('data:image')) {
          console.log('   ✅ Firma inspector ya está en base64')
          yaConvertidas++
        } else {
          console.log(`   📄 Firma inspector: ${oblea.path_firma_inspector.substring(0, 50)}...`)
          const base64 = await convertirImagenABase64(oblea.path_firma_inspector)
          
          if (base64) {
            actualizaciones.path_firma_inspector = base64
            necesitaActualizacion = true
            console.log('   ✅ Firma inspector convertida')
          } else {
            errores++
          }
        }
      } else {
        console.log('   ⚪ No tiene firma inspector')
      }
      
      // 3. Convertir foto de la oblea
      if (oblea.path_foto) {
        if (oblea.path_foto.startsWith('data:image')) {
          console.log('   ✅ Foto ya está en base64')
          yaConvertidas++
        } else {
          console.log(`   📄 Foto oblea: ${oblea.path_foto.substring(0, 50)}...`)
          const base64 = await convertirImagenABase64(oblea.path_foto)
          
          if (base64) {
            actualizaciones.path_foto = base64
            necesitaActualizacion = true
            console.log('   ✅ Foto convertida')
          } else {
            errores++
          }
        }
      } else {
        console.log('   ⚪ No tiene foto')
      }
      
      // 4. Aplicar actualizaciones si hay
      if (necesitaActualizacion && !DRY_RUN) {
        try {
          await prisma.obleas.update({
            where: { id: oblea.id },
            data: actualizaciones
          })
          convertidas++
          console.log('   💾 Cambios guardados en BD')
        } catch (error) {
          console.error(`   ❌ Error guardando: ${error.message}`)
          errores++
        }
      } else if (necesitaActualizacion && DRY_RUN) {
        console.log('   🔍 [DRY RUN] Se aplicarían estos cambios')
        convertidas++
      }
    }
    
    // Resumen
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN DE CONVERSIÓN')
    console.log('='.repeat(60))
    console.log(`✅ Obleas procesadas: ${obleas.length}`)
    console.log(`🔄 Imágenes convertidas: ${convertidas}`)
    console.log(`✔️  Ya estaban convertidas: ${yaConvertidas}`)
    console.log(`❌ Errores: ${errores}`)
    
    if (DRY_RUN) {
      console.log('\n⚠️  MODO DRY RUN - Cambia DRY_RUN a false para aplicar cambios reales')
    } else {
      console.log('\n✅ Conversión completada!')
    }
    
  } catch (error) {
    console.error('\n❌ Error fatal:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
convertirObleas()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script falló:', error)
    process.exit(1)
  })
