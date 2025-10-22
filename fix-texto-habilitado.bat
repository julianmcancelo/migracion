@echo off
echo ========================================
echo    CORRECCION: ESTADO "HABILITADO"
echo ========================================
echo.

git commit -m "fix: corregir textos - usar estado HABILITADO (masculino) en lugar de habilitada"
git push

echo.
echo ========================================
echo    CORRECCIONES APLICADAS:
echo ========================================
echo.
echo ✅ API generar-oblea:
echo    "El estado debe ser HABILITADO para generar oblea"
echo.
echo ✅ Modal de obleas:
echo    "La oblea es valida mientras el estado sea HABILITADO"
echo.
echo ✅ Guia de testing:
echo    "Error: El estado debe ser HABILITADO para generar oblea"
echo.
echo ✅ Documentacion actualizada:
echo    Referencias consistentes al estado HABILITADO
echo.
echo ========================================
echo    CONSISTENCIA DE TEXTOS:
echo ========================================
echo.
echo ❌ ANTES: "habilitacion habilitada"
echo ✅ AHORA: "estado HABILITADO"
echo.
echo ❌ ANTES: "La habilitacion debe estar..."
echo ✅ AHORA: "El estado debe ser HABILITADO..."
echo.
echo ❌ ANTES: "mientras este vigente la habilitacion"
echo ✅ AHORA: "mientras el estado sea HABILITADO"
echo.
echo ¡Textos corregidos y consistentes!
echo.
pause
