@echo off
echo ========================================
echo   FIX: URL EVIDENCIAS DE OBLEAS
echo ========================================
echo.

git commit -m "fix: corregir URL base de evidencias de obleas a api.transportelanus.com.ar"
git push

echo.
echo ========================================
echo    CORRECCION APLICADA:
echo ========================================
echo.
echo URLs de evidencias actualizadas:
echo.
echo ANTES:
echo - https://credenciales.transportelanus.com.ar/...
echo.
echo AHORA:
echo - https://api.transportelanus.com.ar/...
echo.
echo Esto aplica a:
echo - Fotos de evidencia
echo - Firmas del receptor
echo - Firmas del inspector
echo.
echo Deploy en 2-3 minutos...
echo.
pause
