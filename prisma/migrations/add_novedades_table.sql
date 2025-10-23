-- Tabla de Novedades/Auditoría para Habilitaciones
-- Registra TODOS los cambios: habilitación, personas, vehículos, establecimientos, etc.

CREATE TABLE IF NOT EXISTS `habilitaciones_novedades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `habilitacion_id` INT NOT NULL,
  `tipo_novedad` VARCHAR(50) NOT NULL COMMENT 'ALTA, BAJA, MODIFICACION, CAMBIO_VEHICULO, etc.',
  `entidad_afectada` VARCHAR(50) NOT NULL COMMENT 'HABILITACION, PERSONA, VEHICULO, ESTABLECIMIENTO, etc.',
  `entidad_id` INT NULL COMMENT 'ID de la entidad afectada (persona_id, vehiculo_id, etc.)',
  `descripcion` TEXT NOT NULL COMMENT 'Descripción legible de la novedad',
  `datos_anteriores` JSON NULL COMMENT 'Estado anterior (para modificaciones)',
  `datos_nuevos` JSON NULL COMMENT 'Estado nuevo',
  `usuario_id` INT NULL COMMENT 'Usuario que realizó el cambio',
  `usuario_nombre` VARCHAR(100) NULL COMMENT 'Nombre del usuario',
  `fecha_novedad` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `observaciones` TEXT NULL,
  
  INDEX `idx_habilitacion` (`habilitacion_id`),
  INDEX `idx_tipo_novedad` (`tipo_novedad`),
  INDEX `idx_entidad` (`entidad_afectada`, `entidad_id`),
  INDEX `idx_fecha` (`fecha_novedad`),
  
  CONSTRAINT `fk_novedades_habilitacion` 
    FOREIGN KEY (`habilitacion_id`) 
    REFERENCES `habilitaciones_generales` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
