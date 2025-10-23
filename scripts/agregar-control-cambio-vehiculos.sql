-- =====================================================
-- Script: Agregar control de historial de vehículos
-- Fecha: 2025-01-23
-- Descripción: Permite rastrear cambios de vehículos
--              en habilitaciones manteniendo historial
-- =====================================================

USE transpo1_credenciales;

-- 1. Agregar columnas nuevas a habilitaciones_vehiculos
ALTER TABLE habilitaciones_vehiculos
  ADD COLUMN fecha_alta DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha en que se vinculó el vehículo',
  ADD COLUMN fecha_baja DATETIME NULL COMMENT 'Fecha en que se dio de baja (cambio de vehículo)',
  ADD COLUMN activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si es el vehículo actual (TRUE) o histórico (FALSE)',
  ADD COLUMN observaciones_cambio TEXT NULL COMMENT 'Motivo o detalles del cambio de vehículo';

-- 2. Crear índice para optimizar consultas de vehículos activos
CREATE INDEX idx_activo ON habilitaciones_vehiculos(activo);

-- 3. Actualizar registros existentes para marcarlos como activos
UPDATE habilitaciones_vehiculos
SET activo = TRUE,
    fecha_alta = CURRENT_TIMESTAMP
WHERE fecha_alta IS NULL;

-- 4. Ver estadísticas
SELECT 
  COUNT(*) AS total_vinculos,
  SUM(CASE WHEN activo = TRUE THEN 1 ELSE 0 END) AS activos,
  SUM(CASE WHEN activo = FALSE THEN 1 ELSE 0 END) AS historicos
FROM habilitaciones_vehiculos;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Mostrar estructura actualizada
DESCRIBE habilitaciones_vehiculos;

-- Mostrar ejemplos de datos
SELECT 
  hv.id,
  hv.habilitacion_id,
  hv.vehiculo_id,
  v.dominio,
  v.marca,
  v.modelo,
  hv.activo,
  hv.fecha_alta,
  hv.fecha_baja
FROM habilitaciones_vehiculos hv
LEFT JOIN vehiculos v ON hv.vehiculo_id = v.id
LIMIT 10;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
/*
- Los vehículos existentes se marcan automáticamente como activos
- Para cambiar un vehículo, usar el nuevo endpoint API
- No eliminar registros manualmente, solo marcarlos como inactivos
- El historial completo queda registrado con fechas
*/
