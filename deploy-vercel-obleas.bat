@echo off
echo ========================================
echo    DEPLOY VERCEL - SISTEMA DE OBLEAS
echo ========================================
echo.

echo 1. Verificando que todo este commiteado...
git status

echo.
echo 2. Haciendo push final...
git push

echo.
echo 3. Iniciando deploy en Vercel...
echo.
echo ========================================
echo    INSTRUCCIONES MANUALES:
echo ========================================
echo.
echo 1. Ve a https://vercel.com/dashboard
echo 2. Busca tu proyecto "migracion"
echo 3. Vercel detectara automaticamente el nuevo commit
echo 4. El deploy se iniciara automaticamente
echo 5. Espera 2-3 minutos a que termine
echo.
echo URL final: https://migracionnext.vercel.app
echo.
echo ========================================
echo    PARA PROBAR EL SISTEMA DE OBLEAS:
echo ========================================
echo.
echo 1. Ve a https://migracionnext.vercel.app
echo 2. Inicia sesion con tu usuario
echo 3. Ve a "Habilitaciones"
echo 4. Abre cualquier habilitacion activa
echo 5. Click en "Gestionar Obleas" (boton naranja)
echo 6. Click en "Generar Certificado de Oblea"
echo 7. Se descargara el PDF automaticamente
echo.
echo ¡A probar el sistema de obleas!
echo.
pause
