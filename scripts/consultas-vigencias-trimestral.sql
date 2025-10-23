-- ============================================================================
-- CONSULTAS SQL: VIGENCIAS POR TRIMESTRE
-- ============================================================================

-- ============================================================================
-- 1. RESUMEN POR TRIMESTRE (todos los años)
-- ============================================================================

SELECT 
    YEAR(vigencia_inicio) as anio,
    QUARTER(vigencia_inicio) as trimestre,
    CONCAT(YEAR(vigencia_inicio), '-Q', QUARTER(vigencia_inicio)) as periodo,
    COUNT(*) as total_habilitaciones,
    COUNT(CASE WHEN tipo_transporte = 'escolar' THEN 1 END) as escolares,
    COUNT(CASE WHEN tipo_transporte = 'remis' THEN 1 END) as remis,
    COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activas,
    COUNT(CASE WHEN estado = 'vencida' THEN 1 END) as vencidas
FROM habilitaciones_generales
WHERE vigencia_inicio IS NOT NULL
GROUP BY YEAR(vigencia_inicio), QUARTER(vigencia_inicio)
ORDER BY anio DESC, trimestre DESC;

-- ============================================================================
-- 2. DETALLE DE UN TRIMESTRE ESPECÍFICO (ejemplo: Q1 2024)
-- ============================================================================

SELECT 
    hg.id,
    hg.nro_licencia,
    hg.tipo_transporte,
    CONCAT(p.apellido, ' ', p.nombre) as titular,
    p.dni,
    v.dominio,
    v.marca,
    v.modelo,
    hg.vigencia_inicio,
    hg.vigencia_fin,
    hg.estado,
    DATEDIFF(hg.vigencia_fin, CURDATE()) as dias_restantes
FROM habilitaciones_generales hg
LEFT JOIN personas p ON hg.id_persona = p.id
LEFT JOIN vehiculos v ON hg.id_vehiculo = v.id
WHERE 
    YEAR(hg.vigencia_inicio) = 2024
    AND QUARTER(hg.vigencia_inicio) = 1
ORDER BY hg.vigencia_inicio;

-- ============================================================================
-- 3. HABILITACIONES QUE VENCEN EN UN TRIMESTRE FUTURO
-- ============================================================================

-- Por ejemplo, las que vencen en Q2 2025
SELECT 
    hg.id,
    hg.nro_licencia,
    hg.tipo_transporte,
    CONCAT(p.apellido, ' ', p.nombre) as titular,
    p.dni,
    v.dominio,
    hg.vigencia_inicio,
    hg.vigencia_fin,
    DATEDIFF(hg.vigencia_fin, CURDATE()) as dias_para_vencer,
    hg.estado
FROM habilitaciones_generales hg
LEFT JOIN personas p ON hg.id_persona = p.id
LEFT JOIN vehiculos v ON hg.id_vehiculo = v.id
WHERE 
    YEAR(hg.vigencia_fin) = 2025
    AND QUARTER(hg.vigencia_fin) = 2
    AND hg.vigencia_fin >= CURDATE()
ORDER BY hg.vigencia_fin;

-- ============================================================================
-- 4. ESTADÍSTICAS POR TRIMESTRE Y TIPO
-- ============================================================================

SELECT 
    YEAR(vigencia_inicio) as anio,
    QUARTER(vigencia_inicio) as trimestre,
    tipo_transporte,
    COUNT(*) as cantidad,
    AVG(DATEDIFF(vigencia_fin, vigencia_inicio)) as duracion_promedio_dias
FROM habilitaciones_generales
WHERE vigencia_inicio IS NOT NULL
GROUP BY YEAR(vigencia_inicio), QUARTER(vigencia_inicio), tipo_transporte
ORDER BY anio DESC, trimestre DESC, tipo_transporte;

-- ============================================================================
-- 5. VIGENCIAS QUE INICIAN EN EL TRIMESTRE ACTUAL
-- ============================================================================

SELECT 
    hg.id,
    hg.nro_licencia,
    hg.tipo_transporte,
    CONCAT(p.apellido, ' ', p.nombre) as titular,
    v.dominio,
    hg.vigencia_inicio,
    hg.vigencia_fin,
    hg.estado
FROM habilitaciones_generales hg
LEFT JOIN personas p ON hg.id_persona = p.id
LEFT JOIN vehiculos v ON hg.id_vehiculo = v.id
WHERE 
    YEAR(hg.vigencia_inicio) = YEAR(CURDATE())
    AND QUARTER(hg.vigencia_inicio) = QUARTER(CURDATE())
ORDER BY hg.vigencia_inicio DESC;

-- ============================================================================
-- 6. COMPARATIVA TRIMESTRE ACTUAL VS MISMO TRIMESTRE AÑO ANTERIOR
-- ============================================================================

SELECT 
    'Trimestre Actual' as periodo,
    COUNT(*) as total,
    COUNT(CASE WHEN tipo_transporte = 'escolar' THEN 1 END) as escolares,
    COUNT(CASE WHEN tipo_transporte = 'remis' THEN 1 END) as remis
FROM habilitaciones_generales
WHERE 
    YEAR(vigencia_inicio) = YEAR(CURDATE())
    AND QUARTER(vigencia_inicio) = QUARTER(CURDATE())

UNION ALL

SELECT 
    'Mismo Trimestre Año Anterior' as periodo,
    COUNT(*) as total,
    COUNT(CASE WHEN tipo_transporte = 'escolar' THEN 1 END) as escolares,
    COUNT(CASE WHEN tipo_transporte = 'remis' THEN 1 END) as remis
FROM habilitaciones_generales
WHERE 
    YEAR(vigencia_inicio) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR))
    AND QUARTER(vigencia_inicio) = QUARTER(CURDATE());

-- ============================================================================
-- 7. PRÓXIMAS A VENCER EN LOS PRÓXIMOS 3 MESES (trimestre siguiente)
-- ============================================================================

SELECT 
    hg.id,
    hg.nro_licencia,
    hg.tipo_transporte,
    CONCAT(p.apellido, ' ', p.nombre) as titular,
    p.dni,
    p.telefono,
    v.dominio,
    hg.vigencia_fin,
    DATEDIFF(hg.vigencia_fin, CURDATE()) as dias_restantes,
    CASE 
        WHEN DATEDIFF(hg.vigencia_fin, CURDATE()) <= 30 THEN 'URGENTE'
        WHEN DATEDIFF(hg.vigencia_fin, CURDATE()) <= 60 THEN 'PRÓXIMO'
        ELSE 'PROGRAMADO'
    END as prioridad
FROM habilitaciones_generales hg
LEFT JOIN personas p ON hg.id_persona = p.id
LEFT JOIN vehiculos v ON hg.id_vehiculo = v.id
WHERE 
    hg.vigencia_fin BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
    AND hg.estado = 'activo'
ORDER BY hg.vigencia_fin ASC;

-- ============================================================================
-- 8. EVOLUCIÓN TRIMESTRAL (Últimos 4 trimestres)
-- ============================================================================

SELECT 
    CONCAT(YEAR(vigencia_inicio), '-Q', QUARTER(vigencia_inicio)) as trimestre,
    COUNT(*) as nuevas_habilitaciones,
    COUNT(CASE WHEN tipo_transporte = 'escolar' THEN 1 END) as escolares,
    COUNT(CASE WHEN tipo_transporte = 'remis' THEN 1 END) as remis,
    MIN(vigencia_inicio) as primera_fecha,
    MAX(vigencia_inicio) as ultima_fecha
FROM habilitaciones_generales
WHERE 
    vigencia_inicio >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY YEAR(vigencia_inicio), QUARTER(vigencia_inicio)
ORDER BY vigencia_inicio DESC
LIMIT 4;

-- ============================================================================
-- 9. EXPORT PARA EXCEL: TODAS LAS VIGENCIAS CON DATOS COMPLETOS
-- ============================================================================

SELECT 
    CONCAT(YEAR(hg.vigencia_inicio), '-Q', QUARTER(hg.vigencia_inicio)) as trimestre_inicio,
    hg.nro_licencia as 'Nro Licencia',
    hg.tipo_transporte as 'Tipo Transporte',
    p.apellido as 'Apellido',
    p.nombre as 'Nombre',
    p.dni as 'DNI',
    p.telefono as 'Teléfono',
    v.dominio as 'Dominio',
    v.marca as 'Marca',
    v.modelo as 'Modelo',
    v.ano as 'Año',
    DATE_FORMAT(hg.vigencia_inicio, '%d/%m/%Y') as 'Inicio Vigencia',
    DATE_FORMAT(hg.vigencia_fin, '%d/%m/%Y') as 'Fin Vigencia',
    DATEDIFF(hg.vigencia_fin, hg.vigencia_inicio) as 'Duración (días)',
    hg.estado as 'Estado',
    CASE 
        WHEN hg.vigencia_fin < CURDATE() THEN 'VENCIDA'
        WHEN DATEDIFF(hg.vigencia_fin, CURDATE()) <= 30 THEN 'POR VENCER'
        ELSE 'VIGENTE'
    END as 'Situación'
FROM habilitaciones_generales hg
LEFT JOIN personas p ON hg.id_persona = p.id
LEFT JOIN vehiculos v ON hg.id_vehiculo = v.id
WHERE hg.vigencia_inicio IS NOT NULL
ORDER BY hg.vigencia_inicio DESC;

-- ============================================================================
-- FIN DE CONSULTAS
-- ============================================================================
