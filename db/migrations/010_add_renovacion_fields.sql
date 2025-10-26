-- Migración: Agregar campos para sistema de renovación

-- 1. Agregar campos de renovación a habilitaciones_generales
ALTER TABLE habilitaciones_generales 
ADD COLUMN es_renovacion BOOLEAN DEFAULT FALSE COMMENT 'Indica si esta habilitación es una renovación',
ADD COLUMN renovacion_de_id INT DEFAULT NULL COMMENT 'ID de la habilitación anterior que se renovó',
ADD COLUMN fecha_renovacion DATETIME DEFAULT NULL COMMENT 'Fecha en que se creó esta renovación',
ADD COLUMN fue_renovada BOOLEAN DEFAULT FALSE COMMENT 'Indica si esta habilitación ya fue renovada',
ADD COLUMN renovada_en_id INT DEFAULT NULL COMMENT 'ID de la nueva habilitación que renovó esta',
ADD INDEX idx_renovacion (renovacion_de_id),
ADD INDEX idx_fue_renovada (fue_renovada);

-- 2. Comentarios
ALTER TABLE habilitaciones_generales 
COMMENT = 'Habilitaciones de transporte con soporte para renovaciones anuales';

-- 3. Ejemplo de query para encontrar cadena de renovaciones
-- SELECT 
--   id, 
--   anio, 
--   nro_licencia, 
--   expte,
--   es_renovacion,
--   renovacion_de_id,
--   fue_renovada,
--   renovada_en_id
-- FROM habilitaciones_generales 
-- WHERE nro_licencia = '123/2024' 
-- ORDER BY anio DESC;
