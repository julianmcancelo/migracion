/**
 * Verificar que las URLs de las obleas funcionan
 * 
 * Hace peticiones HTTP a las URLs para verificar que las imágenes existen
 */

const { PrismaClient } = require('@prisma/client')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient()

// Verificar una URL
function verificarURL(url) {
  return new Promise((resolve) => {
    const protocolo = url.startsWith('https') ? https : http
    
    const req = protocolo.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve({ existe: true, status: res.statusCode })
      } else {
        resolve({ existe: false, status: res.statusCode })
      }
    })
    
    req.on('error', (error) => {
      resolve({ existe: false, error: error.message })
    })
    
    req.setTimeout(5000, () => {
      req.destroy()
      resolve({ existe: false, error: 'Timeout' })
    })
  })
}

async function verificarObleas() {
  const obleaId = process.argv[2]
  
  console.log('🔍 VERIFICANDO URLs DE OBLEAS\n')
  console.log('='.repeat(80))
  
  try {
    let obleas
    
    if (obleaId) {
      console.log(`\n📋 Verificando oblea ID: ${obleaId}\n`)
      obleas = [await prisma.obleas.findUnique({ where: { id: parseInt(obleaId) } })]
      if (!obleas[0]) {
        console.error('❌ Oblea no encontrada')
        return
      }
    } else {
      console.log('\n📋 Verificando primeras 5 obleas...\n')
      obleas = await prisma.obleas.findMany({
        take: 5,
        orderBy: { id: 'asc' }
      })
    }
    
    let existenFirmaReceptor = 0
    let existenFirmaInspector = 0
    let existenFoto = 0
    let errorFirmaReceptor = 0
    let errorFirmaInspector = 0
    let errorFoto = 0
    
    for (const oblea of obleas) {
      console.log('\n' + '─'.repeat(80))
      console.log(`🆔 Oblea ID: ${oblea.id} - ${oblea.nro_licencia}`)
      
      // Verificar firma receptor
      if (oblea.path_firma_receptor) {
        console.log('\n✍️  FIRMA RECEPTOR:')
        console.log(`   URL: ${oblea.path_firma_receptor}`)
        
        const resultado = await verificarURL(oblea.path_firma_receptor)
        if (resultado.existe) {
          console.log(`   ✅ Existe (Status: ${resultado.status})`)
          existenFirmaReceptor++
        } else {
          console.log(`   ❌ No existe (${resultado.error || 'Status: ' + resultado.status})`)
          errorFirmaReceptor++
        }
      } else {
        console.log('\n✍️  FIRMA RECEPTOR: ⚪ No tiene')
      }
      
      // Verificar firma inspector
      if (oblea.path_firma_inspector) {
        console.log('\n✍️  FIRMA INSPECTOR:')
        console.log(`   URL: ${oblea.path_firma_inspector}`)
        
        const resultado = await verificarURL(oblea.path_firma_inspector)
        if (resultado.existe) {
          console.log(`   ✅ Existe (Status: ${resultado.status})`)
          existenFirmaInspector++
        } else {
          console.log(`   ❌ No existe (${resultado.error || 'Status: ' + resultado.status})`)
          errorFirmaInspector++
        }
      } else {
        console.log('\n✍️  FIRMA INSPECTOR: ⚪ No tiene')
      }
      
      // Verificar foto
      if (oblea.path_foto) {
        console.log('\n📷 FOTO:')
        console.log(`   URL: ${oblea.path_foto}`)
        
        const resultado = await verificarURL(oblea.path_foto)
        if (resultado.existe) {
          console.log(`   ✅ Existe (Status: ${resultado.status})`)
          existenFoto++
        } else {
          console.log(`   ❌ No existe (${resultado.error || 'Status: ' + resultado.status})`)
          errorFoto++
        }
      } else {
        console.log('\n📷 FOTO: ⚪ No tiene')
      }
    }
    
    // Resumen
    if (obleas.length > 1) {
      console.log('\n' + '='.repeat(80))
      console.log('📊 RESUMEN')
      console.log('='.repeat(80))
      console.log(`\n✅ Firmas receptor accesibles: ${existenFirmaReceptor}`)
      console.log(`❌ Firmas receptor con error: ${errorFirmaReceptor}`)
      console.log(`\n✅ Firmas inspector accesibles: ${existenFirmaInspector}`)
      console.log(`❌ Firmas inspector con error: ${errorFirmaInspector}`)
      console.log(`\n✅ Fotos accesibles: ${existenFoto}`)
      console.log(`❌ Fotos con error: ${errorFoto}`)
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarObleas()
