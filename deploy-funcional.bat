@echo off
echo ================================================
echo   DEPLOY COMPLETO - TODO FUNCIONAL
echo ================================================
echo.

echo [1/3] Agregando archivos...
git add .

echo.
echo [2/3] Creando commit...
git commit -m "feat: Dashboard funcional con datos reales, API de vencimientos y UI mejorada"

echo.
echo [3/3] Pusheando a GitHub...
git push origin master

echo.
echo ================================================
echo   DEPLOY COMPLETADO EXITOSAMENTE!
echo ================================================
echo.
echo NUEVAS FUNCIONALIDADES:
echo - Dashboard con datos reales de la BD
echo - API de vencimientos detallados
echo - Alertas criticas visuales (vencidas, por vencer)
echo - Lista de proximos vencimientos con detalles
echo - Estadisticas en tiempo real
echo - UI moderna y profesional en Habilitaciones
echo - Formulario multi-paso con info completa
echo.
echo Vercel comenzara el deploy automaticamente.
echo Revisa: https://vercel.com/dashboard
echo.
pause
