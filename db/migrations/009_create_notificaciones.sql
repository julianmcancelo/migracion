-- Tabla para almacenar notificaciones del sistema
CREATE TABLE IF NOT EXISTS notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL COMMENT 'ID del usuario que recibirá la notificación',
  tipo VARCHAR(50) NOT NULL COMMENT 'Tipo: contacto_nuevo, habilitacion_vencida, turno_nuevo, etc.',
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  icono VARCHAR(50) DEFAULT '🔔' COMMENT 'Emoji o clase de icono',
  url VARCHAR(500) DEFAULT NULL COMMENT 'URL a donde redirigir al hacer click',
  leida BOOLEAN DEFAULT FALSE,
  fecha_creacion DATETIME NOT NULL,
  fecha_lectura DATETIME DEFAULT NULL,
  metadata JSON DEFAULT NULL COMMENT 'Datos adicionales en formato JSON',
  
  INDEX idx_usuario_leida (usuario_id, leida),
  INDEX idx_fecha_creacion (fecha_creacion),
  INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentario de la tabla
ALTER TABLE notificaciones 
COMMENT = 'Notificaciones del sistema para usuarios administrativos';
