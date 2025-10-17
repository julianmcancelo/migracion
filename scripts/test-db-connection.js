#!/usr/bin/env node

/**
 * Script para probar la conexión a MySQL
 * Uso: node scripts/test-db-connection.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function testConnection() {
  console.log('🔍 Probando conexión a MySQL...\n');
  
  // Parsear DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL no está definida en .env');
    process.exit(1);
  }

  console.log('📋 DATABASE_URL encontrada');
  
  // Extraer componentes de la URL
  const urlRegex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+?)(\?.*)?$/;
  const match = dbUrl.match(urlRegex);
  
  if (!match) {
    console.error('❌ ERROR: Formato de DATABASE_URL inválido');
    console.log('Formato esperado: mysql://user:password@host:port/database');
    process.exit(1);
  }

  const [, user, password, host, port, database] = match;
  
  console.log('\n📊 Configuración detectada:');
  console.log(`  Usuario: ${user}`);
  console.log(`  Host: ${host}`);
  console.log(`  Puerto: ${port}`);
  console.log(`  Base de datos: ${database}`);
  console.log(`  Contraseña: ${'*'.repeat(password.length)}\n`);

  let connection;
  
  try {
    console.log('🔌 Intentando conectar...');
    
    connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
      connectTimeout: 10000,
    });

    console.log('✅ Conexión establecida exitosamente!\n');

    // Probar una query simple
    console.log('🔍 Probando query de prueba...');
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('✅ Query ejecutada correctamente\n');

    // Obtener información del servidor
    console.log('📊 Información del servidor MySQL:');
    const [version] = await connection.query('SELECT VERSION() as version');
    console.log(`  Versión: ${version[0].version}`);

    const [vars] = await connection.query("SHOW VARIABLES LIKE 'max_connections'");
    console.log(`  Max conexiones: ${vars[0].Value}`);

    // Listar tablas
    console.log('\n📋 Tablas en la base de datos:');
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('  ⚠️  No hay tablas en la base de datos');
    } else {
      tables.forEach((table, i) => {
        const tableName = Object.values(table)[0];
        console.log(`  ${i + 1}. ${tableName}`);
      });
    }

    // Verificar tabla admin
    console.log('\n🔍 Verificando tabla "admin"...');
    const [adminCheck] = await connection.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'admin'",
      [database]
    );

    if (adminCheck[0].count > 0) {
      console.log('✅ Tabla "admin" encontrada');
      
      const [adminCount] = await connection.query('SELECT COUNT(*) as count FROM admin');
      console.log(`  Total de usuarios admin: ${adminCount[0].count}`);
    } else {
      console.log('⚠️  Tabla "admin" NO encontrada');
      console.log('   Necesitas ejecutar las migraciones de Prisma o crear la tabla manualmente');
    }

    console.log('\n✨ Todas las pruebas pasaron correctamente!\n');
    console.log('🚀 Tu base de datos está lista para usar con Next.js\n');

  } catch (error) {
    console.error('\n❌ ERROR al conectar a MySQL:\n');
    console.error(`  Mensaje: ${error.message}`);
    console.error(`  Código: ${error.code}`);
    
    console.log('\n💡 Soluciones comunes:\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('  1. Verifica que MySQL esté corriendo');
      console.log('  2. Verifica que el host y puerto sean correctos');
      console.log('  3. Si usas "localhost", prueba con "127.0.0.1"');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('  1. Verifica el usuario y contraseña');
      console.log('  2. Asegúrate que el usuario tenga permisos para la base de datos');
      console.log('  3. Si usas acceso remoto, verifica que el usuario permita conexiones desde tu IP');
    } else if (error.code === 'ENOTFOUND') {
      console.log('  1. El host no existe o no es accesible');
      console.log('  2. Verifica la URL de conexión');
      console.log('  3. Verifica tu conexión a internet');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('  1. El servidor MySQL no responde');
      console.log('  2. Puede haber un firewall bloqueando el puerto 3306');
      console.log('  3. Verifica que el servidor MySQL acepte conexiones remotas');
    }
    
    console.log('');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada\n');
    }
  }
}

// Ejecutar
testConnection().catch(console.error);
