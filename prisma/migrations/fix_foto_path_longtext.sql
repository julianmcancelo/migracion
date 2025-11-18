-- Cambiar foto_path de VARCHAR(255) a LONGTEXT para soportar imágenes Base64 completas
-- Ejecutar este SQL directamente en la base de datos

ALTER TABLE `inspeccion_fotos` 
MODIFY COLUMN `foto_path` LONGTEXT NULL;

ALTER TABLE `inspeccion_detalles` 
MODIFY COLUMN `foto_path` LONGTEXT NULL;
