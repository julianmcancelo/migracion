/**
 * Script para migrar paradas desde JSON a la base de datos
 * Ejecutar con: npx ts-node scripts/migrar-paradas-json.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Mapeo de tipos del JSON al enum de la base de datos
const mapearTipo = (tipo: string): string => {
  const tipos: Record<string, string> = {
    'transporte': 'transporte',
    'municipal': 'municipal',
    'seguridad': 'seguridad',
    'salud': 'salud',
    'educacion': 'educacion',
    'semaforo': 'semaforo',
  }
  return tipos[tipo?.toLowerCase()] || 'transporte'
}

// Mapear status a estado
const mapearEstado = (status: string): string => {
  const estados: Record<string, string> = {
    'ok': 'ok',
    'falla': 'falla',
    'mantenimiento': 'mantenimiento',
  }
  return estados[status?.toLowerCase()] || 'ok'
}

async function migrarParadas() {
  try {
    console.log('🚀 Iniciando migración de paradas...\n')

    // Leer el archivo JSON
    const jsonPath = path.join(process.cwd(), 'paradas', 'points.json')
    
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ No se encontró el archivo: ${jsonPath}`)
      return
    }

    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const paradas = JSON.parse(jsonData)

    console.log(`📄 Se encontraron ${paradas.length} paradas en el JSON\n`)

    // Contador de paradas procesadas
    let creadas = 0
    let actualizadas = 0
    let errores = 0

    for (const parada of paradas) {
      try {
        // Validar datos mínimos
        if (!parada.title || !parada.lat || !parada.lng) {
          console.warn(`⚠️  Parada sin datos mínimos (title, lat, lng):`, parada.id || 'sin ID')
          errores++
          continue
        }

        // Buscar si ya existe una parada en la misma ubicación
        const paradaExistente = await prisma.paradas.findFirst({
          where: {
            latitud: parada.lat,
            longitud: parada.lng,
          },
        })

        if (paradaExistente) {
          // Actualizar
          await prisma.paradas.update({
            where: { id: paradaExistente.id },
            data: {
              titulo: parada.title || parada.titulo || 'Sin título',
              tipo: mapearTipo(parada.type || parada.tipo) as any,
              descripcion: parada.description || parada.descripcion || null,
              estado: mapearEstado(parada.status || parada.estado) as any,
              activo: true,
            },
          })
          actualizadas++
          console.log(`✅ Actualizada: ${parada.title}`)
        } else {
          // Crear nueva
          await prisma.paradas.create({
            data: {
              titulo: parada.title || parada.titulo || 'Sin título',
              tipo: mapearTipo(parada.type || parada.tipo) as any,
              descripcion: parada.description || parada.descripcion || null,
              latitud: parseFloat(parada.lat),
              longitud: parseFloat(parada.lng),
              estado: mapearEstado(parada.status || parada.estado) as any,
              activo: true,
            },
          })
          creadas++
          console.log(`➕ Creada: ${parada.title}`)
        }
      } catch (error: any) {
        console.error(`❌ Error procesando parada "${parada.title}":`, error.message)
        errores++
      }
    }

    console.log('\n📊 Resumen de la migración:')
    console.log(`   ✅ Creadas: ${creadas}`)
    console.log(`   🔄 Actualizadas: ${actualizadas}`)
    console.log(`   ❌ Errores: ${errores}`)
    console.log(`\n✨ Migración completada!\n`)

  } catch (error) {
    console.error('❌ Error en la migración:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
migrarParadas()
