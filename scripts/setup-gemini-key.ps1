# Script para configurar la nueva API key de Gemini en todos los ambientes

$GEMINI_KEY = "AIzaSyB2mKi3bq_qd-30LodQDSN2LQbtkW9h5UQ"
$basePath = Split-Path -Parent $PSScriptRoot

Write-Host "🔑 Configurando nueva API Key de Gemini..." -ForegroundColor Cyan
Write-Host ""

# Archivos de entorno a actualizar
$envFiles = @(
    ".env",
    ".env.local"
)

foreach ($envFile in $envFiles) {
    $envPath = Join-Path $basePath $envFile
    
    if (Test-Path $envPath) {
        Write-Host "📝 Actualizando $envFile..." -ForegroundColor Yellow
        
        $content = Get-Content $envPath -Raw
        
        # Si ya existe GEMINI_API_KEY, reemplazarla
        if ($content -match 'GEMINI_API_KEY=') {
            $newContent = $content -replace 'GEMINI_API_KEY=.*', "GEMINI_API_KEY=`"$GEMINI_KEY`""
            Set-Content -Path $envPath -Value $newContent -NoNewline
            Write-Host "   ✅ API Key actualizada en $envFile" -ForegroundColor Green
        }
        # Si no existe, agregarla
        else {
            Add-Content -Path $envPath -Value "`n# Google Gemini API para OCR y chat IA"
            Add-Content -Path $envPath -Value "GEMINI_API_KEY=`"$GEMINI_KEY`""
            Write-Host "   ✅ API Key agregada a $envFile" -ForegroundColor Green
        }
    }
    else {
        Write-Host "⚠️  $envFile no existe, creándolo..." -ForegroundColor Yellow
        
        # Copiar desde .env.example si existe
        $examplePath = Join-Path $basePath ".env.example"
        if (Test-Path $examplePath) {
            Copy-Item $examplePath $envPath
            
            # Actualizar la key
            $content = Get-Content $envPath -Raw
            $newContent = $content -replace 'GEMINI_API_KEY=.*', "GEMINI_API_KEY=`"$GEMINI_KEY`""
            Set-Content -Path $envPath -Value $newContent -NoNewline
            
            Write-Host "   ✅ Creado $envFile con la API Key" -ForegroundColor Green
        }
        else {
            Write-Host "   ❌ No se pudo crear $envFile (falta .env.example)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Límites de la API gratuita:" -ForegroundColor Cyan
Write-Host "   • gemini-1.5-flash: 15 req/min, 1,500 req/día" -ForegroundColor Gray
Write-Host "   • gemini-1.5-pro: 2 req/min, 50 req/día" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Reinicia el servidor: npm run dev" -ForegroundColor White
Write-Host "   2. Prueba el OCR: http://localhost:3000/api/ocr/dni-gemini" -ForegroundColor White
Write-Host "   3. Monitorea uso: https://aistudio.google.com/app/apikey" -ForegroundColor White
Write-Host ""
