-- Tabla para registrar accesos públicos a credenciales
-- Útil para auditoría y seguridad

CREATE TABLE IF NOT EXISTS logs_acceso_credencial (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dni VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  fecha_acceso DATETIME NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  INDEX idx_dni (dni),
  INDEX idx_email (email),
  INDEX idx_fecha (fecha_acceso),
  INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentario de la tabla
ALTER TABLE logs_acceso_credencial 
COMMENT = 'Registro de accesos públicos a credenciales digitales por parte de contribuyentes';
