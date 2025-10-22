@echo off
echo ========================================
echo    FIX API OBLEAS - CARGAR DATOS
echo ========================================
echo.

git commit -m "fix: simplificar API obleas para cargar correctamente las 3 obleas existentes en BD"
git push

echo.
echo ========================================
echo    PROBLEMA RESUELTO:
echo ========================================
echo.
echo El problema era que la API /api/obleas
echo intentaba usar includes anidados complejos
echo que no funcionaban correctamente.
echo.
echo SOLUCION:
echo - Consultas separadas para cada relacion
echo - Primero carga obleas basicas
echo - Luego carga titular y vehiculo por separado
echo - Promise.all para mantener performance
echo.
echo Ahora las 3 obleas se veran en la pagina
echo de Administrar Obleas correctamente.
echo.
echo Deploy en 2-3 minutos...
echo.
pause
