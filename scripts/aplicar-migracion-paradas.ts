/**
 * Script para aplicar la migración de paradas_imagenes directamente a la base de datos
 * Ejecutar con: npx ts-node scripts/aplicar-migracion-paradas.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function aplicarMigracion() {
  try {
    console.log('🔧 Aplicando migración de paradas_imagenes...\n')

    // Verificar si la tabla ya existe
    const resultado = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'paradas_imagenes'
    `)

    if (resultado[0].count > 0) {
      console.log('✅ La tabla paradas_imagenes ya existe en la base de datos.')
      console.log('   No es necesario aplicar la migración.\n')
      return
    }

    // Crear la tabla
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS paradas_imagenes (
        id INT NOT NULL AUTO_INCREMENT,
        parada_id INT NOT NULL,
        imagen_base64 MEDIUMTEXT NOT NULL,
        descripcion VARCHAR(255) NULL,
        orden INT NOT NULL DEFAULT 0,
        creado_en DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX idx_parada_id (parada_id),
        CONSTRAINT paradas_imagenes_parada_id_fkey 
          FOREIGN KEY (parada_id) 
          REFERENCES paradas (id) 
          ON DELETE CASCADE 
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('✅ Tabla paradas_imagenes creada exitosamente!\n')

  } catch (error: any) {
    console.error('❌ Error aplicando migración:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
aplicarMigracion()
