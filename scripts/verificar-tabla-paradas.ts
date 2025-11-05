import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificar() {
  try {
    // Intentar consultar la tabla paradas_imagenes
    const count = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'paradas_imagenes'
    `)

    console.log('Resultado:', count)
    
    if (count[0].count > 0) {
      console.log('✅ La tabla paradas_imagenes existe')
      
      // Contar registros en paradas
      const paradasCount = await prisma.paradas.count()
      console.log(`📊 Total de paradas en DB: ${paradasCount}`)
    } else {
      console.log('❌ La tabla paradas_imagenes NO existe')
      console.log('Ejecutando creación...')
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE paradas_imagenes (
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
      
      console.log('✅ Tabla creada exitosamente')
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

verificar()
