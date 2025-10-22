@echo off
echo ========================================
echo   CARGAR OBLEAS CON EVIDENCIA FISICA
echo ========================================
echo.

git commit -m "feat: agregar soporte para obleas con evidencia fisica (fotos y firmas) del sistema legacy"
git push

echo.
echo ========================================
echo    MEJORAS IMPLEMENTADAS:
echo ========================================
echo.
echo NUEVA FUNCIONALIDAD:
echo - Cargar obleas del sistema viejo (tabla obleas)
echo - Mostrar fotos de evidencia de colocacion
echo - Mostrar firmas del receptor e inspector
echo - Enlaces directos a las imagenes
echo.
echo CAMBIOS EN SCHEMA PRISMA:
echo - Relacion obleas -^> habilitaciones_generales
echo - Relacion inversa en habilitaciones_generales
echo.
echo NUEVA API:
echo - GET /api/obleas/evidencias
echo - Filtra por habilitacion_id
echo.
echo MODAL DE OBLEAS MEJORADO:
echo - Seccion nueva: Historial con Evidencia Fisica
echo - Tarjetas moradas con info de colocacion
echo - Enlaces a fotos y firmas
echo - Carga automatica al abrir modal
echo.
echo DATOS QUE SE MUESTRAN:
echo - ID de oblea fisica
echo - Titular que recibio
echo - Fecha y hora de colocacion
echo - Foto de evidencia (enlace)
echo - Firma del receptor (enlace)
echo - Firma del inspector (enlace)
echo.
echo ========================================
echo   DONDE VER LAS OBLEAS CON EVIDENCIA:
echo ========================================
echo.
echo 1. Ve a Habilitaciones
echo 2. Click en "Gestionar Obleas" de cualquier habilitacion
echo 3. Si hay obleas con evidencia fisica, veras una
echo    seccion morada "Historial de Colocacion con
echo    Evidencia Fisica" al final del modal
echo 4. Click en los enlaces para ver fotos y firmas
echo.
echo Deploy en 2-3 minutos...
echo.
pause
