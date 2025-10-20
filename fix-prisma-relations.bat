@echo off
git commit -m "fix: agregar relaciones Prisma entre oblea_historial y habilitaciones_generales"
git push
echo.
echo ========================================
echo FIX DE RELACIONES PRISMA DEPLOYADO
echo ========================================
echo.
echo Se agregaron las relaciones bidireccionales:
echo - habilitaciones_generales -^> oblea_historial[]
echo - oblea_historial -^> habilitaciones_generales
echo.
echo Esto corrige el error de compilacion TypeScript en Vercel.
echo.
pause
