# Script para actualizar todos los endpoints de Gemini al modelo optimizado
# Cambia gemini-2.0-flash-exp por gemini-1.5-flash

$basePath = Split-Path -Parent $PSScriptRoot
$apiPath = Join-Path $basePath "app\api"

Write-Host "🔍 Buscando archivos con gemini-2.0-flash-exp..." -ForegroundColor Cyan

$files = Get-ChildItem -Path $apiPath -Recurse -Filter "*.ts" | 
    Where-Object { (Get-Content $_.FullName -Raw) -match 'gemini-2\.0-flash-exp' }

if ($files.Count -eq 0) {
    Write-Host "✅ No se encontraron archivos con el modelo antiguo" -ForegroundColor Green
    exit 0
}

Write-Host "📝 Encontrados $($files.Count) archivo(s) para actualizar:" -ForegroundColor Yellow
$files | ForEach-Object { Write-Host "   - $($_.FullName)" -ForegroundColor Gray }

Write-Host ""
$confirm = Read-Host "¿Actualizar todos los archivos? (S/N)"

if ($confirm -ne 'S' -and $confirm -ne 's') {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Actualizando archivos..." -ForegroundColor Cyan

$updated = 0
$failed = 0

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $newContent = $content -replace 'gemini-2\.0-flash-exp', 'gemini-1.5-flash'
        
        if ($content -ne $newContent) {
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
            Write-Host "✅ $($file.Name)" -ForegroundColor Green
            $updated++
        } else {
            Write-Host "⚠️  $($file.Name) - Sin cambios" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $($file.Name) - Error: $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "   ✅ Actualizados: $updated" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "   ❌ Fallidos: $failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 ¡Proceso completado!" -ForegroundColor Green
Write-Host "💡 Recuerda reiniciar el servidor para aplicar los cambios" -ForegroundColor Yellow
