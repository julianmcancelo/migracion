@echo off
echo ====================================
echo PREPARANDO DEPLOY A VERCEL
echo ====================================
echo.

echo [1/3] Agregando archivos...
git add .

echo.
echo [2/3] Creando commit...
git commit -m "fix: Corregir tipos TypeScript en formulario multi-paso"

echo.
echo [3/3] Pusheando a GitHub...
git push origin master

echo.
echo ====================================
echo DEPLOY INICIADO EN VERCEL
echo ====================================
echo.
echo Vercel detectara los cambios automaticamente y comenzara el build.
echo Puedes ver el progreso en: https://vercel.com/dashboard
echo.
pause
