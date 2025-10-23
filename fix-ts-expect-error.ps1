# Script para agregar descripciones a 

$files = Get-ChildItem -Path "app\api" -Filter "*.ts" -Recurse
$files += Get-ChildItem -Path "lib" -Filter "*.ts" -Recurse

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw
  
  # Reemplazar  sin descripcion
  $newContent = $content -replace '\s*\n', " -- Prisma types compatibility`n"
  
  if ($content -ne $newContent) {
    Set-Content $file.FullName $newContent -NoNewline
    Write-Host "OK Actualizado: $($file.FullName)"
  }
}

Write-Host ""
Write-Host "Proceso completado"
