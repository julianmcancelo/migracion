# Script para agregar descripciones a @ts-expect-error

$files = Get-ChildItem -Path "app\api" -Filter "*.ts" -Recurse
$files += Get-ChildItem -Path "lib" -Filter "*.ts" -Recurse

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw
  
  # Reemplazar @ts-expect-error sin descripcion
  $newContent = $content -replace '@ts-expect-error\s*\n', "@ts-expect-error -- Prisma types compatibility`n"
  
  if ($content -ne $newContent) {
    Set-Content $file.FullName $newContent -NoNewline
    Write-Host "OK Actualizado: $($file.FullName)"
  }
}

Write-Host ""
Write-Host "Proceso completado"
