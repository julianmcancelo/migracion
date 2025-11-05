-- Crear tabla de imágenes de paradas
CREATE TABLE IF NOT EXISTS `paradas_imagenes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `parada_id` INT NOT NULL,
  `imagen_base64` MEDIUMTEXT NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  `orden` INT NOT NULL DEFAULT 0,
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_parada_id` (`parada_id`),
  CONSTRAINT `paradas_imagenes_parada_id_fkey` 
    FOREIGN KEY (`parada_id`) 
    REFERENCES `paradas` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
