/**
 * Script de diagnóstico para obleas
 * 
 * Verifica qué obleas tienen imágenes y en qué formato
 * 
 * Uso: node scripts/diagnosticar-obleas.js [id]
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function verificarArchivo(filePath) {
  if (!filePath) return { existe: false, formato: 'vacío' }
  
  if (filePath.startsWith('data:image')) {
    return { 
      existe: true, 
      formato: 'base64',
      tamano: Math.round(filePath.length / 1024) + ' KB',
      tipo: filePath.split(';')[0].replace('data:', '')
    }
  }
  
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return { 
      existe: '?', 
      formato: 'URL externa',
      url: filePath
    }
  }
  
  // Verificar si el archivo existe localmente
  let existe = false
  let rutaCompleta = ''
  
  try {
    // Intentar path directo
    if (fs.existsSync(filePath)) {
      existe = true
      rutaCompleta = filePath
    } else {
      // Intentar desde public/
      const publicPath = path.join(process.cwd(), 'public', filePath)
      if (fs.existsSync(publicPath)) {
        existe = true
        rutaCompleta = publicPath
      }
    }
    
    if (existe) {
      const stats = fs.statSync(rutaCompleta)
      return {
        existe: true,
        formato: 'archivo local',
        path: rutaCompleta,
        tamano: Math.round(stats.size / 1024) + ' KB'
      }
    }
  } catch (err) {
    // Ignorar
  }
  
  return {
    existe: false,
    formato: 'archivo local (no encontrado)',
    path: filePath
  }
}

async function diagnosticar() {
  const obleaId = process.argv[2]
  
  console.log('🔍 DIAGNÓSTICO DE OBLEAS\n')
  console.log('='.repeat(80))
  
  try {
    let obleas
    
    if (obleaId) {
      console.log(`\n📋 Analizando oblea ID: ${obleaId}\n`)
      obleas = [await prisma.obleas.findUnique({ where: { id: parseInt(obleaId) } })]
      if (!obleas[0]) {
        console.error('❌ Oblea no encontrada')
        return
      }
    } else {
      console.log('\n📋 Analizando todas las obleas...\n')
      obleas = await prisma.obleas.findMany({
        orderBy: { id: 'asc' }
      })
    }
    
    for (const oblea of obleas) {
      console.log('\n' + '─'.repeat(80))
      console.log(`🆔 Oblea ID: ${oblea.id}`)
      console.log(`📝 Licencia: ${oblea.nro_licencia}`)
      console.log(`👤 Titular: ${oblea.titular}`)
      console.log(`📅 Fecha: ${oblea.fecha_colocacion.toLocaleDateString('es-AR')}`)
      
      // Verificar firma receptor
      console.log('\n✍️  FIRMA RECEPTOR:')
      const firmaReceptor = await verificarArchivo(oblea.path_firma_receptor)
      console.log(`   Existe: ${firmaReceptor.existe ? '✅' : '❌'}`)
      console.log(`   Formato: ${firmaReceptor.formato}`)
      if (firmaReceptor.tamano) console.log(`   Tamaño: ${firmaReceptor.tamano}`)
      if (firmaReceptor.path) console.log(`   Path: ${firmaReceptor.path}`)
      if (firmaReceptor.url) console.log(`   URL: ${firmaReceptor.url}`)
      
      // Verificar firma inspector
      console.log('\n✍️  FIRMA INSPECTOR:')
      const firmaInspector = await verificarArchivo(oblea.path_firma_inspector)
      console.log(`   Existe: ${firmaInspector.existe ? '✅' : '❌'}`)
      console.log(`   Formato: ${firmaInspector.formato}`)
      if (firmaInspector.tamano) console.log(`   Tamaño: ${firmaInspector.tamano}`)
      if (firmaInspector.path) console.log(`   Path: ${firmaInspector.path}`)
      if (firmaInspector.url) console.log(`   URL: ${firmaInspector.url}`)
      
      // Verificar foto
      console.log('\n📷 FOTO OBLEA:')
      const foto = await verificarArchivo(oblea.path_foto)
      console.log(`   Existe: ${foto.existe ? '✅' : '❌'}`)
      console.log(`   Formato: ${foto.formato}`)
      if (foto.tamano) console.log(`   Tamaño: ${foto.tamano}`)
      if (foto.path) console.log(`   Path: ${foto.path}`)
      if (foto.url) console.log(`   URL: ${foto.url}`)
      
      // Resumen
      const problemas = []
      if (!firmaReceptor.existe) problemas.push('Firma receptor no encontrada')
      if (!firmaInspector.existe) problemas.push('Firma inspector no encontrada')
      if (!foto.existe) problemas.push('Foto no encontrada')
      
      if (problemas.length > 0) {
        console.log('\n⚠️  PROBLEMAS DETECTADOS:')
        problemas.forEach(p => console.log(`   ❌ ${p}`))
      } else {
        console.log('\n✅ Todas las imágenes están disponibles')
      }
    }
    
    // Resumen general si son múltiples obleas
    if (obleas.length > 1) {
      console.log('\n' + '='.repeat(80))
      console.log('📊 RESUMEN GENERAL')
      console.log('='.repeat(80))
      
      let conFirmaReceptor = 0
      let conFirmaInspector = 0
      let conFoto = 0
      let base64 = 0
      let archivosLocales = 0
      let urls = 0
      let errores = 0
      
      for (const oblea of obleas) {
        const fr = await verificarArchivo(oblea.path_firma_receptor)
        const fi = await verificarArchivo(oblea.path_firma_inspector)
        const fo = await verificarArchivo(oblea.path_foto)
        
        if (fr.existe) conFirmaReceptor++
        if (fi.existe) conFirmaInspector++
        if (fo.existe) conFoto++
        
        if (fr.formato === 'base64' || fi.formato === 'base64' || fo.formato === 'base64') base64++
        if (fr.formato === 'archivo local' || fi.formato === 'archivo local' || fo.formato === 'archivo local') archivosLocales++
        if (fr.formato === 'URL externa' || fi.formato === 'URL externa' || fo.formato === 'URL externa') urls++
        
        if (!fr.existe || !fi.existe || !fo.existe) errores++
      }
      
      console.log(`\n📋 Total obleas: ${obleas.length}`)
      console.log(`✅ Con firma receptor: ${conFirmaReceptor}`)
      console.log(`✅ Con firma inspector: ${conFirmaInspector}`)
      console.log(`✅ Con foto: ${conFoto}`)
      console.log(`\n📊 Formatos:`)
      console.log(`   Base64: ${base64}`)
      console.log(`   Archivos locales: ${archivosLocales}`)
      console.log(`   URLs externas: ${urls}`)
      console.log(`\n⚠️  Obleas con problemas: ${errores}`)
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnosticar()
