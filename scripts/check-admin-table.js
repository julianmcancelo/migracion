#!/usr/bin/env node

const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env' })

async function checkAdminTable() {
  const dbUrl = process.env.DATABASE_URL
  const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+?)(\?.*)?$/)
  const [, user, password, host, port, database] = match

  const connection = await mysql.createConnection({
    host,
    port: parseInt(port),
    user,
    password,
    database,
  })

  console.log('\n📊 Estructura de la tabla "admin":\n')

  const [columns] = await connection.query('DESCRIBE admin')
  console.table(columns)

  console.log('\n📋 Datos de ejemplo (primer registro):\n')
  const [rows] = await connection.query('SELECT * FROM admin LIMIT 1')
  console.log(rows[0])

  await connection.end()
}

checkAdminTable().catch(console.error)
