@echo off
echo ========================================
echo    FIX RENDER BAD GATEWAY - SOLUCION
echo ========================================
echo.

echo Subiendo fixes para resolver Bad Gateway...
git commit -m "fix: configuracion mejorada para Render - servidor personalizado y health check"
git push

echo.
echo ========================================
echo    CAMBIOS APLICADOS:
echo ========================================
echo.
echo 1. ✅ Servidor personalizado (server.js)
echo 2. ✅ Health check endpoint (/api/health)  
echo 3. ✅ Next.config mejorado para produccion
echo 4. ✅ Render.yaml optimizado
echo.
echo ========================================
echo    PROXIMOS PASOS EN RENDER:
echo ========================================
echo.
echo 1. Ve al Dashboard de Render
echo 2. Tu servicio se redesployara automaticamente
echo 3. Monitorea los logs en tiempo real
echo 4. Verifica que DATABASE_URL este configurada
echo 5. La app deberia funcionar en 3-5 minutos
echo.
echo URL: https://credenciales-lanus.onrender.com
echo Health: https://credenciales-lanus.onrender.com/api/health
echo.
pause
