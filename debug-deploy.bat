@echo off
echo ========================================
echo    DIAGNOSTICO DE DEPLOY - OBLEAS
echo ========================================
echo.

echo 1. Verificando estado del repositorio...
git log --oneline -5

echo.
echo 2. Verificando que el push se hizo correctamente...
git status

echo.
echo ========================================
echo    VERIFICACIONES MANUALES NECESARIAS:
echo ========================================
echo.
echo 1. VERCEL DASHBOARD:
echo    - Ve a https://vercel.com/dashboard
echo    - Busca tu proyecto "migracion"
echo    - Verifica que el ultimo deploy este "Ready"
echo    - Si esta "Building" espera a que termine
echo.
echo 2. HEALTH CHECK:
echo    - Ve a https://migracionnext.vercel.app/api/health
echo    - Deberia mostrar status: "healthy"
echo    - Si da error, hay problema con el deploy
echo.
echo 3. PAGINA PRINCIPAL:
echo    - Ve a https://migracionnext.vercel.app
echo    - Deberia cargar la pagina de login
echo    - Si no carga, hay error en el build
echo.
echo 4. CONSOLA DEL NAVEGADOR:
echo    - Abre DevTools (F12)
echo    - Ve a Console
echo    - Busca errores en rojo
echo    - Copia cualquier error que veas
echo.
echo ========================================
echo    POSIBLES PROBLEMAS:
echo ========================================
echo.
echo ❌ Deploy aun en progreso (esperar 2-3 min)
echo ❌ Error en el build de Vercel
echo ❌ Problema con variables de entorno
echo ❌ Error de TypeScript no detectado localmente
echo ❌ Problema con dependencias (jsPDF)
echo.
echo ¡Revisa Vercel Dashboard primero!
echo.
pause
