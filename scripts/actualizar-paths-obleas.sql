-- ============================================================================
-- ACTUALIZAR PATHS DE OBLEAS PARA APUNTAR A LA API
-- ============================================================================
-- 
-- Los archivos están en: https://api.transportelanus.com.ar/v2/storage/
-- Pero en la BD están guardados como: /v2/storage/...
--
-- Este script actualiza todos los paths para que sean URLs completas.
-- ============================================================================

-- Ver estado ANTES de actualizar
SELECT 
  'ANTES DE ACTUALIZAR' as estado,
  id,
  nro_licencia,
  LEFT(path_firma_receptor, 60) as firma_receptor,
  LEFT(path_firma_inspector, 60) as firma_inspector,
  LEFT(path_foto, 60) as foto
FROM obleas
WHERE id IN (8, 9, 10)
LIMIT 5;

-- ============================================================================
-- ACTUALIZAR FIRMAS RECEPTOR
-- ============================================================================

UPDATE obleas 
SET path_firma_receptor = CONCAT('https://api.transportelanus.com.ar', path_firma_receptor)
WHERE 
  path_firma_receptor IS NOT NULL 
  AND path_firma_receptor LIKE '/v2/storage/%'
  AND path_firma_receptor NOT LIKE 'http%';

-- ============================================================================
-- ACTUALIZAR FIRMAS INSPECTOR
-- ============================================================================

UPDATE obleas 
SET path_firma_inspector = CONCAT('https://api.transportelanus.com.ar', path_firma_inspector)
WHERE 
  path_firma_inspector IS NOT NULL 
  AND path_firma_inspector LIKE '/v2/storage/%'
  AND path_firma_inspector NOT LIKE 'http%';

-- ============================================================================
-- ACTUALIZAR FOTOS
-- ============================================================================

UPDATE obleas 
SET path_foto = CONCAT('https://api.transportelanus.com.ar', path_foto)
WHERE 
  path_foto IS NOT NULL 
  AND path_foto LIKE '/v2/storage/%'
  AND path_foto NOT LIKE 'http%';

-- ============================================================================
-- Ver estado DESPUÉS de actualizar
-- ============================================================================

SELECT 
  'DESPUÉS DE ACTUALIZAR' as estado,
  id,
  nro_licencia,
  LEFT(path_firma_receptor, 60) as firma_receptor,
  LEFT(path_firma_inspector, 60) as firma_inspector,
  LEFT(path_foto, 60) as foto
FROM obleas
WHERE id IN (8, 9, 10)
LIMIT 5;

-- ============================================================================
-- Verificar todas las obleas actualizadas
-- ============================================================================

SELECT 
  COUNT(*) as total_obleas,
  SUM(CASE WHEN path_firma_receptor LIKE 'https://api.transportelanus.com.ar%' THEN 1 ELSE 0 END) as con_url_firma_receptor,
  SUM(CASE WHEN path_firma_inspector LIKE 'https://api.transportelanus.com.ar%' THEN 1 ELSE 0 END) as con_url_firma_inspector,
  SUM(CASE WHEN path_foto LIKE 'https://api.transportelanus.com.ar%' THEN 1 ELSE 0 END) as con_url_foto
FROM obleas;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
