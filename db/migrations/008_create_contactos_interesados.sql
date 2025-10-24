-- Tabla para almacenar emails de personas interesadas que solicitaron información
-- Útil para marketing, comunicaciones y seguimiento de prospectos

CREATE TABLE IF NOT EXISTS contactos_interesados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  origen VARCHAR(50) NOT NULL COMMENT 'De dónde vino el contacto: requisitos_landing, credencial_busqueda, etc.',
  fecha_registro DATETIME NOT NULL,
  ultima_consulta DATETIME DEFAULT NULL,
  contador_consultas INT DEFAULT 1 COMMENT 'Número de veces que solicitó información',
  suscrito_newsletter BOOLEAN DEFAULT FALSE,
  notas TEXT,
  INDEX idx_email (email),
  INDEX idx_origen (origen),
  INDEX idx_fecha_registro (fecha_registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentario de la tabla
ALTER TABLE contactos_interesados 
COMMENT = 'Contactos de personas interesadas que solicitaron información sobre requisitos y trámites';

-- Insertar algunos datos de ejemplo (opcional)
-- INSERT INTO contactos_interesados (email, origen, fecha_registro) 
-- VALUES ('ejemplo@test.com', 'requisitos_landing', NOW());
