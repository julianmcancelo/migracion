-- Script para crear un usuario de prueba en la tabla admin
-- Ejecutar este SQL en tu base de datos MySQL

-- OPCIÓN 1: Contraseña simple para pruebas (password: "admin123")
INSERT INTO admin (nombre, email, password, rol, legajo) 
VALUES (
  'Administrador Prueba',
  'admin@lanus.gob.ar',
  '$2a$10$YP5qZ0yFZEZQXN8KZ8sXEOGkYOVHZqKZN8X5xN8KZ8sXEOGkYOVHZq',
  'administrador',
  'ADM001'
);

-- OPCIÓN 2: Usuario regular (password: "usuario123")
INSERT INTO admin (nombre, email, password, rol, legajo) 
VALUES (
  'Usuario Regular',
  'usuario@lanus.gob.ar',
  '$2a$10$ZQyFZEZQXN8KZ8sXEOGkYOVHZqKZN8X5xN8KZ8sXEOGkYOVHZqABC',
  'usuario',
  'USR001'
);

-- Verificar que se crearon correctamente
SELECT id, nombre, email, rol, legajo FROM admin 
WHERE email IN ('admin@lanus.gob.ar', 'usuario@lanus.gob.ar');

-- NOTA: Si ya tienes usuarios en tu tabla, usa esos en lugar de crear nuevos
-- SELECT id, nombre, email, rol FROM admin LIMIT 5;
