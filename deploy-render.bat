@echo off
echo ========================================
echo    DEPLOY A RENDER - CREDENCIALES LANUS
echo ========================================
echo.

echo 1. Agregando archivos al repositorio...
git add .

echo 2. Haciendo commit...
git commit -m "feat: configuracion para deploy en Render con render.yaml"

echo 3. Subiendo a GitHub...
git push

echo.
echo ========================================
echo    PROXIMOS PASOS MANUALES:
echo ========================================
echo.
echo 1. Ve a https://render.com
echo 2. Conecta tu cuenta de GitHub
echo 3. Selecciona el repositorio "migracion"
echo 4. Render detectara render.yaml automaticamente
echo 5. Configura las variables de entorno:
echo    - DATABASE_URL (MySQL actual o nueva PostgreSQL)
echo    - GMAIL_USER y GMAIL_APP_PASSWORD
echo 6. Haz el primer deploy
echo.
echo URL final sera: https://credenciales-lanus.onrender.com
echo.
pause
