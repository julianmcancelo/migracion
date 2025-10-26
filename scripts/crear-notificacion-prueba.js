/**
 * Script para crear notificaciones de prueba
 * Ejecutar: node scripts/crear-notificacion-prueba.js
 */

require('dotenv').config()
const mysql = require('mysql2/promise')

async function crearNotificacionPrueba() {
  let connection

  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST || 'localhost',
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'habilitaciones_db',
    })

    console.log('✓ Conectado a la base de datos')

    // Obtener el primer admin
    const [admins] = await connection.query(
      'SELECT id, nombre, email FROM admin LIMIT 1'
    )

    if (admins.length === 0) {
      console.error('❌ No se encontró ningún administrador')
      return
    }

    const admin = admins[0]
    console.log(`✓ Admin encontrado: ${admin.nombre} (${admin.email})`)

    // Crear notificación de prueba
    const [result] = await connection.query(
      `INSERT INTO notificaciones 
       (usuario_id, tipo, titulo, mensaje, icono, url, fecha_creacion, leida)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), FALSE)`,
      [
        admin.id,
        'contacto_nuevo',
        'Nuevo contacto interesado',
        'prueba@example.com solicitó información desde requisitos_landing',
        '📧',
        '/dashboard?seccion=contactos',
      ]
    )

    console.log(`✓ Notificación creada con ID: ${result.insertId}`)

    // Crear algunas notificaciones adicionales
    await connection.query(
      `INSERT INTO notificaciones 
       (usuario_id, tipo, titulo, mensaje, icono, url, fecha_creacion, leida)
       VALUES 
       (?, 'habilitacion_vencida', 'Habilitación por vencer', 'La habilitación #123 vence en 7 días', '⚠️', '/habilitaciones/123', NOW(), FALSE),
       (?, 'inspeccion_asignada', 'Nueva inspección asignada', 'Se asignó una inspección para hoy a las 15:00', '📋', '/inspecciones', DATE_SUB(NOW(), INTERVAL 2 HOUR), TRUE),
       (?, 'turno_nuevo', 'Nuevo turno solicitado', 'María García solicitó un turno para mañana', '📅', '/turnos', DATE_SUB(NOW(), INTERVAL 5 HOUR), FALSE)`,
      [admin.id, admin.id, admin.id]
    )

    console.log('✓ Notificaciones adicionales creadas')

    // Mostrar resumen
    const [count] = await connection.query(
      'SELECT COUNT(*) as total, SUM(leida = FALSE) as no_leidas FROM notificaciones WHERE usuario_id = ?',
      [admin.id]
    )

    console.log('\n📊 Resumen:')
    console.log(`   Total de notificaciones: ${count[0].total}`)
    console.log(`   No leídas: ${count[0].no_leidas}`)
    console.log('\n✅ Notificaciones de prueba creadas exitosamente')
    console.log('\n💡 Recarga tu aplicación y verás el badge de notificaciones en el header')
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

crearNotificacionPrueba()
