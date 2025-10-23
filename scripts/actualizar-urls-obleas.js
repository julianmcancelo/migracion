/**
 * Actualizar paths de obleas a URLs completas
 * 
 * Los archivos están en: https://api.transportelanus.com.ar/v2/storage/
 * Pero en la BD están como: /v2/storage/...
 * 
 * Este script actualiza todos los paths para que sean URLs completas
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const BASE_URL = 'https://api.transportelanus.com.ar'

async function actualizarURLs() {
  console.log('🚀 Actualizando paths de obleas a URLs completas...\n')
  console.log(`📍 Base URL: ${BASE_URL}\n`)
  
  try {
    // Obtener todas las obleas
    const obleas = await prisma.obleas.findMany({
      orderBy: { id: 'asc' }
    })
    
    console.log(`📋 Total de obleas: ${obleas.length}\n`)
    
    let actualizadas = 0
    let yaEranURLs = 0
    let sinCambios = 0
    
    for (const oblea of obleas) {
      let necesitaActualizacion = false
      const actualizaciones = {}
      
      console.log(`\n🔄 Procesando Oblea ID: ${oblea.id} - ${oblea.nro_licencia}`)
      
      // Firma receptor
      if (oblea.path_firma_receptor) {
        if (oblea.path_firma_receptor.startsWith('http')) {
          console.log('   ✅ Firma receptor ya es URL')
          yaEranURLs++
        } else if (oblea.path_firma_receptor.startsWith('/v2/storage/')) {
          const nuevaURL = BASE_URL + oblea.path_firma_receptor
          actualizaciones.path_firma_receptor = nuevaURL
          necesitaActualizacion = true
          console.log(`   🔄 Firma receptor: ${oblea.path_firma_receptor}`)
          console.log(`   ➡️  Nueva URL: ${nuevaURL}`)
        }
      }
      
      // Firma inspector
      if (oblea.path_firma_inspector) {
        if (oblea.path_firma_inspector.startsWith('http')) {
          console.log('   ✅ Firma inspector ya es URL')
          yaEranURLs++
        } else if (oblea.path_firma_inspector.startsWith('/v2/storage/')) {
          const nuevaURL = BASE_URL + oblea.path_firma_inspector
          actualizaciones.path_firma_inspector = nuevaURL
          necesitaActualizacion = true
          console.log(`   🔄 Firma inspector: ${oblea.path_firma_inspector}`)
          console.log(`   ➡️  Nueva URL: ${nuevaURL}`)
        }
      }
      
      // Foto
      if (oblea.path_foto) {
        if (oblea.path_foto.startsWith('http')) {
          console.log('   ✅ Foto ya es URL')
          yaEranURLs++
        } else if (oblea.path_foto.startsWith('/v2/storage/')) {
          const nuevaURL = BASE_URL + oblea.path_foto
          actualizaciones.path_foto = nuevaURL
          necesitaActualizacion = true
          console.log(`   🔄 Foto: ${oblea.path_foto}`)
          console.log(`   ➡️  Nueva URL: ${nuevaURL}`)
        }
      }
      
      // Aplicar actualizaciones
      if (necesitaActualizacion) {
        try {
          await prisma.obleas.update({
            where: { id: oblea.id },
            data: actualizaciones
          })
          actualizadas++
          console.log('   💾 ✅ Actualizado en BD')
        } catch (error) {
          console.error(`   ❌ Error actualizando: ${error.message}`)
        }
      } else {
        sinCambios++
        console.log('   ⚪ Sin cambios necesarios')
      }
    }
    
    // Resumen
    console.log('\n' + '='.repeat(70))
    console.log('📊 RESUMEN')
    console.log('='.repeat(70))
    console.log(`✅ Obleas actualizadas: ${actualizadas}`)
    console.log(`✔️  Ya eran URLs: ${yaEranURLs}`)
    console.log(`⚪ Sin cambios: ${sinCambios}`)
    console.log(`📋 Total procesadas: ${obleas.length}`)
    
    console.log('\n✅ Actualización completada!')
    
  } catch (error) {
    console.error('\n❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
actualizarURLs()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script falló:', error)
    process.exit(1)
  })
