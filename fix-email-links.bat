@echo off
echo ========================================
echo    FIX ENLACES UNDEFINED EN EMAILS
echo ========================================
echo.

git commit -m "fix: corregir enlaces undefined en emails de recordatorio - usar NEXT_PUBLIC_APP_URL y rutas turnos-publico correctas"
git push

echo.
echo ========================================
echo    PROBLEMA RESUELTO:
echo ========================================
echo.
echo ❌ ANTES: process.env.NEXT_PUBLIC_URL (undefined)
echo ✅ AHORA: process.env.NEXT_PUBLIC_APP_URL
echo.
echo ❌ ANTES: /turnos/confirmar/ (ruta incorrecta)
echo ✅ AHORA: /turnos-publico/confirmar/
echo.
echo ❌ ANTES: /turnos/cancelar/ (ruta incorrecta)  
echo ✅ AHORA: /turnos-publico/cancelar/
echo.
echo ========================================
echo    VERIFICAR EN PRODUCCION:
echo ========================================
echo.
echo 1. Asegurate que NEXT_PUBLIC_APP_URL este configurada
echo 2. En Vercel: https://migracionnext.vercel.app
echo 3. En Render: https://credenciales-lanus.onrender.com
echo 4. Envia un recordatorio de turno de prueba
echo 5. Verifica que los enlaces funcionen correctamente
echo.
echo ¡Enlaces de email arreglados!
echo.
pause
