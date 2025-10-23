/**
 * Consultar habilitaciones por trimestres según vigencia_inicio
 * 
 * Uso: 
 *   node scripts/consultar-vigencias-trimestral.js          // Todos los trimestres
 *   node scripts/consultar-vigencias-trimestral.js 2024     // Solo año 2024
 *   node scripts/consultar-vigencias-trimestral.js 2024 1   // Solo Q1 2024
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Función para obtener trimestre de una fecha
function obtenerTrimestre(fecha) {
  const mes = fecha.getMonth() + 1 // 1-12
  if (mes <= 3) return 1
  if (mes <= 6) return 2
  if (mes <= 9) return 3
  return 4
}

// Función para formatear trimestre
function formatearTrimestre(anio, trimestre) {
  const trimestres = {
    1: 'Q1 (Ene-Mar)',
    2: 'Q2 (Abr-Jun)',
    3: 'Q3 (Jul-Sep)',
    4: 'Q4 (Oct-Dic)'
  }
  return `${anio} - ${trimestres[trimestre]}`
}

// Función para obtener rango de fechas del trimestre
function rangoTrimestre(anio, trimestre) {
  const mesInicio = (trimestre - 1) * 3 + 1
  const mesFin = trimestre * 3
  
  const inicio = new Date(anio, mesInicio - 1, 1)
  const fin = new Date(anio, mesFin, 0) // Último día del mes
  
  return { inicio, fin }
}

async function consultarVigenciasTrimestral() {
  const anioFiltro = process.argv[2] ? parseInt(process.argv[2]) : null
  const trimestreFiltro = process.argv[3] ? parseInt(process.argv[3]) : null
  
  console.log('📅 CONSULTA DE VIGENCIAS POR TRIMESTRE\n')
  console.log('='.repeat(80))
  
  if (anioFiltro && trimestreFiltro) {
    console.log(`\n🔍 Filtrando: Año ${anioFiltro} - Trimestre ${trimestreFiltro}\n`)
  } else if (anioFiltro) {
    console.log(`\n🔍 Filtrando: Año ${anioFiltro}\n`)
  } else {
    console.log('\n📊 Mostrando todos los trimestres\n')
  }
  
  try {
    // Obtener todas las habilitaciones con vigencia
    const habilitaciones = await prisma.habilitaciones_generales.findMany({
      where: {
        vigencia_inicio: {
          not: null
        }
      },
      select: {
        id: true,
        nro_licencia: true,
        tipo_transporte: true,
        vigencia_inicio: true,
        vigencia_fin: true,
        estado: true,
        persona: {
          select: {
            apellido: true,
            nombre: true,
            dni: true
          }
        },
        vehiculo: {
          select: {
            dominio: true,
            marca: true,
            modelo: true
          }
        }
      },
      orderBy: {
        vigencia_inicio: 'asc'
      }
    })
    
    console.log(`✅ Total habilitaciones con vigencia: ${habilitaciones.length}\n`)
    
    // Agrupar por trimestre
    const porTrimestre = {}
    
    habilitaciones.forEach(hab => {
      if (!hab.vigencia_inicio) return
      
      const fecha = new Date(hab.vigencia_inicio)
      const anio = fecha.getFullYear()
      const trimestre = obtenerTrimestre(fecha)
      
      // Aplicar filtros si existen
      if (anioFiltro && anio !== anioFiltro) return
      if (trimestreFiltro && trimestre !== trimestreFiltro) return
      
      const clave = `${anio}-Q${trimestre}`
      
      if (!porTrimestre[clave]) {
        porTrimestre[clave] = {
          anio,
          trimestre,
          habilitaciones: []
        }
      }
      
      porTrimestre[clave].habilitaciones.push(hab)
    })
    
    // Ordenar trimestres
    const trimestresOrdenados = Object.keys(porTrimestre).sort()
    
    if (trimestresOrdenados.length === 0) {
      console.log('⚠️  No se encontraron habilitaciones para los filtros aplicados\n')
      return
    }
    
    // Mostrar resultados
    console.log('─'.repeat(80))
    
    trimestresOrdenados.forEach(clave => {
      const datos = porTrimestre[clave]
      const { anio, trimestre, habilitaciones: habs } = datos
      
      console.log(`\n📆 ${formatearTrimestre(anio, trimestre)}`)
      console.log('─'.repeat(80))
      console.log(`📊 Total habilitaciones: ${habs.length}`)
      
      // Estadísticas por tipo
      const porTipo = {}
      const porEstado = {}
      
      habs.forEach(h => {
        const tipo = h.tipo_transporte || 'Sin tipo'
        const estado = h.estado || 'Sin estado'
        
        porTipo[tipo] = (porTipo[tipo] || 0) + 1
        porEstado[estado] = (porEstado[estado] || 0) + 1
      })
      
      console.log('\n📋 Por tipo de transporte:')
      Object.entries(porTipo).forEach(([tipo, cant]) => {
        console.log(`   ${tipo}: ${cant}`)
      })
      
      console.log('\n📊 Por estado:')
      Object.entries(porEstado).forEach(([estado, cant]) => {
        const emoji = estado === 'HABILITADO' ? '✅' : 
                     estado === 'EN_TRAMITE' ? '⏳' : 
                     estado === 'NO_HABILITADO' ? '❌' : '⚪'
        const destacado = estado === 'HABILITADO' ? `\x1b[32m${emoji} ${estado}: ${cant}\x1b[0m` : 
                         `${emoji} ${estado}: ${cant}`
        console.log(`   ${destacado}`)
      })
      
      // Mostrar primeras 5 habilitaciones
      console.log('\n📝 Primeras habilitaciones del trimestre:')
      habs.slice(0, 5).forEach((h, idx) => {
        const titular = h.persona 
          ? `${h.persona.apellido || ''} ${h.persona.nombre || ''}`.trim()
          : 'Sin titular'
        
        const vehiculo = h.vehiculo
          ? `${h.vehiculo.dominio || 'S/D'}`
          : 'S/D'
        
        const vigenciaInicio = new Date(h.vigencia_inicio).toLocaleDateString('es-AR')
        const vigenciaFin = h.vigencia_fin 
          ? new Date(h.vigencia_fin).toLocaleDateString('es-AR')
          : 'Indefinida'
        
        // Destacar si está HABILITADO
        const estadoEmoji = h.estado === 'HABILITADO' ? '✅' : 
                           h.estado === 'EN_TRAMITE' ? '⏳' : 
                           h.estado === 'NO_HABILITADO' ? '❌' : '⚪'
        
        const linea = h.estado === 'HABILITADO' 
          ? `\x1b[32m   ${idx + 1}. ${estadoEmoji} Lic: ${h.nro_licencia || 'S/N'} | ${titular} | ${vehiculo}\x1b[0m`
          : `   ${idx + 1}. ${estadoEmoji} Lic: ${h.nro_licencia || 'S/N'} | ${titular} | ${vehiculo}`
        
        console.log(linea)
        console.log(`      Vigencia: ${vigenciaInicio} → ${vigenciaFin} | Estado: ${h.estado || 'N/A'}`)
      })
      
      if (habs.length > 5) {
        console.log(`   ... y ${habs.length - 5} más`)
      }
    })
    
    // Resumen general
    console.log('\n' + '='.repeat(80))
    console.log('📊 RESUMEN GENERAL')
    console.log('='.repeat(80))
    console.log(`\n📅 Trimestres con datos: ${trimestresOrdenados.length}`)
    console.log(`✅ Total habilitaciones: ${habilitaciones.filter(h => {
      if (!h.vigencia_inicio) return false
      const fecha = new Date(h.vigencia_inicio)
      const anio = fecha.getFullYear()
      const trimestre = obtenerTrimestre(fecha)
      if (anioFiltro && anio !== anioFiltro) return false
      if (trimestreFiltro && trimestre !== trimestreFiltro) return false
      return true
    }).length}`)
    
    // Trimestre con más habilitaciones
    const maxTrimestre = trimestresOrdenados.reduce((max, clave) => {
      return porTrimestre[clave].habilitaciones.length > porTrimestre[max].habilitaciones.length ? clave : max
    }, trimestresOrdenados[0])
    
    const maxDatos = porTrimestre[maxTrimestre]
    console.log(`\n🏆 Trimestre con más habilitaciones: ${formatearTrimestre(maxDatos.anio, maxDatos.trimestre)}`)
    console.log(`   Cantidad: ${maxDatos.habilitaciones.length}`)
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
consultarVigenciasTrimestral()
