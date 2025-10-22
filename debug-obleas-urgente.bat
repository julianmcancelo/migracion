@echo off
echo ========================================
echo    DEBUG URGENTE - OBLEAS NO APARECEN
echo ========================================
echo.

echo 1. Verificando ultimo commit...
git log --oneline -1

echo.
echo 2. Estado del repositorio...
git status

echo.
echo ========================================
echo    VERIFICACIONES INMEDIATAS:
echo ========================================
echo.
echo 1. VERCEL DASHBOARD:
echo    - Ve a https://vercel.com/dashboard
echo    - Proyecto "migracion"
echo    - ¿Estado: Ready, Building, Failed?
echo.
echo 2. CACHE DEL NAVEGADOR:
echo    - Presiona Ctrl+Shift+R (recarga fuerte)
echo    - O abre ventana incognito
echo    - Prueba desde otro navegador
echo.
echo 3. HEALTH CHECK:
echo    - Ve a https://migracionnext.vercel.app/api/health
echo    - ¿Muestra {"status":"healthy"}?
echo.
echo 4. CONSOLA DEL NAVEGADOR:
echo    - F12 → Console
echo    - ¿Hay errores en rojo?
echo    - Copia cualquier error
echo.
echo ========================================
echo    DONDE BUSCAR EL MENU DE OBLEAS:
echo ========================================
echo.
echo 1. https://migracionnext.vercel.app
echo 2. Login → Habilitaciones
echo 3. Busca una fila con estado "HABILITADO" (verde)
echo 4. En esa fila, busca los 3 puntos verticales (⋮)
echo 5. Click en ⋮ → Deberia aparecer menu desplegable
echo 6. En el menu: "🛡️ Gestionar Obleas"
echo.
echo ========================================
echo    SI NO APARECE EL MENU:
echo ========================================
echo.
echo ❌ Posibles causas:
echo    - Deploy fallido en Vercel
echo    - Error de JavaScript en navegador
echo    - Cache del navegador
echo    - Habilitacion no tiene estado HABILITADO
echo.
echo ✅ Soluciones:
echo    - Revisar Vercel Dashboard
echo    - Limpiar cache (Ctrl+Shift+R)
echo    - Verificar consola de errores
echo    - Probar con otra habilitacion
echo.
echo ¡Reporta exactamente que ves!
echo.
pause
