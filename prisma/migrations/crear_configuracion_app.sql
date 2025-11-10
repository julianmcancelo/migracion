-- =====================================================
-- Migración: Crear tabla de configuración de la app
-- Fecha: 2025-01-10
-- Descripción: Tabla para almacenar configuración
--              personalizable (logo, título, colores)
-- =====================================================

-- Crear tabla
CREATE TABLE IF NOT EXISTS `configuracion_app` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(200) NOT NULL DEFAULT 'Sistema de Gestión',
  `subtitulo` VARCHAR(300) NULL,
  `logo_base64` LONGTEXT NULL COMMENT 'Logo de la aplicación en base64',
  `favicon_base64` LONGTEXT NULL COMMENT 'Favicon en base64',
  `color_primario` VARCHAR(20) NULL DEFAULT '#2563eb' COMMENT 'Color principal de la interfaz',
  `color_secundario` VARCHAR(20) NULL DEFAULT '#1e40af' COMMENT 'Color secundario',
  `pie_pagina` TEXT NULL COMMENT 'Texto del pie de página',
  `actualizado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `actualizado_por` INT NULL COMMENT 'ID del admin que actualizó',
  PRIMARY KEY (`id`),
  INDEX `idx_actualizado_en` (`actualizado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configuración personalizable de la aplicación';

-- Insertar configuración por defecto
INSERT INTO `configuracion_app` (
  `titulo`,
  `subtitulo`,
  `color_primario`,
  `color_secundario`,
  `pie_pagina`
) VALUES (
  'Sistema de Gestión Municipal',
  'Municipio de Lanús',
  '#2563eb',
  '#1e40af',
  '© 2025 Municipio de Lanús. Todos los derechos reservados.'
) ON DUPLICATE KEY UPDATE `id` = `id`;

-- Verificar que se creó correctamente
SELECT 
  'Tabla creada exitosamente' AS status,
  COUNT(*) AS registros,
  `titulo`,
  `subtitulo`
FROM `configuracion_app`
LIMIT 1;
