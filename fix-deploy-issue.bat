@echo off
echo ========================================
echo    FIX DEPLOY ISSUE - SOLUCION RAPIDA
echo ========================================
echo.

echo Opcion 1: Instalar jsPDF correctamente
npm install jspdf --save

echo.
echo Opcion 2: Verificar que no hay errores de TypeScript
npx tsc --noEmit

echo.
echo Opcion 3: Build local para detectar errores
npm run build

echo.
echo ========================================
echo    SI SIGUE FALLANDO:
echo ========================================
echo.
echo 1. Revisa Vercel Dashboard para ver el error exacto
echo 2. Ve a la seccion "Functions" del deploy fallido
echo 3. Busca el log de error especifico
echo 4. Copia el mensaje de error completo
echo.
echo ¡Ejecuta este script para diagnosticar!
echo.
pause
