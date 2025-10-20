@echo off
echo ========================================
echo    VERIFICAR ESTADO DEL DEPLOY
echo ========================================
echo.

echo 1. Ultimo commit subido:
git log --oneline -1

echo.
echo 2. Estado del repositorio:
git status

echo.
echo ========================================
echo    VERIFICACIONES MANUALES URGENTES:
echo ========================================
echo.
echo 1. VERCEL DASHBOARD:
echo    Ve a: https://vercel.com/dashboard
echo    Busca: proyecto "migracion" 
echo    Estado: ¿Ready, Building, o Failed?
echo.
echo 2. HEALTH CHECK:
echo    Ve a: https://migracionnext.vercel.app/api/health
echo    Deberia mostrar: {"status":"healthy"}
echo.
echo 3. PAGINA PRINCIPAL:
echo    Ve a: https://migracionnext.vercel.app
echo    ¿Carga la pagina de login?
echo.
echo 4. CACHE DEL NAVEGADOR:
echo    Presiona Ctrl+F5 para refrescar sin cache
echo    O abre en ventana incognito
echo.
echo ========================================
echo    SI EL DEPLOY ESTA "READY":
echo ========================================
echo.
echo 1. Inicia sesion en: https://migracionnext.vercel.app
echo 2. Ve a "Habilitaciones"
echo 3. Abre una habilitacion con estado "HABILITADO"
echo 4. Busca el boton naranja "Gestionar Obleas"
echo 5. Deberia estar junto a otros botones de accion
echo.
echo ¡Reporta que ves en cada paso!
echo.
pause
