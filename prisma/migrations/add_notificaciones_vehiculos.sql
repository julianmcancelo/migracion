-- Tabla para registrar notificaciones de documentos vencidos enviadas
CREATE TABLE IF NOT EXISTS notificaciones_vehiculos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehiculo_id INT NOT NULL,
  persona_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL COMMENT 'Tipo: documentos_vencidos, datos_faltantes',
  documentos_notificados TEXT COMMENT 'JSON con documentos notificados',
  email_destinatario VARCHAR(255) NOT NULL,
  fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  enviado_por INT NOT NULL COMMENT 'ID del admin que envió',
  
  INDEX idx_vehiculo (vehiculo_id),
  INDEX idx_persona (persona_id),
  INDEX idx_fecha (fecha_envio),
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
  FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
