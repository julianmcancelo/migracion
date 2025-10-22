@echo off
echo ========================================
echo    PUSH FINAL PARA TESTING DE OBLEAS
echo ========================================
echo.

git commit -m "docs: guia completa de testing para sistema de obleas y scripts de deploy"
git push

echo.
echo ========================================
echo    ¡LISTO PARA TESTING EN PRODUCCION!
echo ========================================
echo.
echo 🚀 URL de testing: https://migracionnext.vercel.app
echo 📋 Guia completa: GUIA_TESTING_OBLEAS.md
echo.
echo ========================================
echo    PASOS RAPIDOS PARA PROBAR:
echo ========================================
echo.
echo 1. Ve a https://migracionnext.vercel.app
echo 2. Inicia sesion
echo 3. Habilitaciones → Ver detalles de una activa
echo 4. Click "Gestionar Obleas" (boton naranja)
echo 5. Click "Generar Certificado de Oblea"
echo 6. ¡Deberia descargarse el PDF automaticamente!
echo.
echo ¡A PROBAR EL SISTEMA DE OBLEAS! 🎯
echo.
pause
