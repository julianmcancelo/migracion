@echo off
echo ========================================
echo   DEPLOY A VERCEL - FASE 3 COMPLETA
echo ========================================
echo.

echo [1/3] Agregando todos los archivos...
git add .

echo.
echo [2/3] Creando commit...
git commit -m "feat: Mejoras UI formulario multi-paso con informacion completa de entidades"

echo.
echo [3/3] Pusheando a GitHub (triggereara Vercel)...
git push origin master

echo.
echo ========================================
echo   COMPLETADO!
echo ========================================
echo.
echo Cambios implementados:
echo - Visualizacion mejorada de personas con DNI y rol
echo - Informacion completa de vehiculos (dominio, marca, modelo, ano)
echo - Detalles de establecimientos con direccion y localidad
echo - Hover effects y transiciones suaves
echo - Iconos mas grandes y mejor espaciado
echo - Correccion de tipos TypeScript
echo.
echo Vercel comenzara el deploy automaticamente.
echo Revisa: https://vercel.com/dashboard
echo.
pause
