# Script para reemplazar  por  en todos los archivos

$files = @(
  "app\api\habilitaciones\[id]\route.ts",
  "app\api\inspecciones\[id]\pdf\route.ts",
  "app\api\inspecciones\[id]\route.ts",
  "app\api\turnos\route.ts",
  "app\api\turnos\[id]\cancelar-publico\route.ts",
  "app\api\turnos\[id]\confirmar-publico\route.ts",
  "app\api\turnos\[id]\reprogramar-publico\route.ts",
  "lib\pdf-generator.ts"
)

foreach ($file in $files) {
  $fullPath = Join-Path $PSScriptRoot $file
  if (Test-Path $fullPath) {
    Write-Host "Procesando: $file"
    $content = Get-Content $fullPath -Raw
    $newContent = $content -replace '', ''
    Set-Content $fullPath $newContent -NoNewline
    Write-Host "  ✓ Actualizado"
  } else {
    Write-Host "  ⚠ No encontrado: $file"
  }
}

Write-Host "`n✅ Proceso completado"
