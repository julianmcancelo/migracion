# Script para configurar la API key de Gemini en Vercel (producción)

$GEMINI_KEY = "AIzaSyB2mKi3bq_qd-30LodQDSN2LQbtkW9h5UQ"

Write-Host "🚀 Configurando API Key de Gemini en Vercel..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Vercel CLI está instalado
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI no está instalado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📦 Instalando Vercel CLI..." -ForegroundColor Cyan
    npm install -g vercel
    Write-Host ""
}

Write-Host "🔑 Configurando variable de entorno en Vercel..." -ForegroundColor Cyan
Write-Host ""

# Crear archivo temporal con la key
$tempFile = [System.IO.Path]::GetTempFileName()
Set-Content -Path $tempFile -Value $GEMINI_KEY

Write-Host "💡 Ejecutando comando de Vercel..." -ForegroundColor Yellow
Write-Host "   vercel env add GEMINI_API_KEY production" -ForegroundColor Gray
Write-Host ""

# Configurar para todos los ambientes
$environments = @("production", "preview", "development")

foreach ($env in $environments) {
    Write-Host "📝 Configurando para: $env" -ForegroundColor Cyan
    
    # Usar Get-Content con pipe para simular input
    Get-Content $tempFile | vercel env add GEMINI_API_KEY $env 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Configurado en $env" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Ya existe o error en $env (puedes actualizar manualmente)" -ForegroundColor Yellow
    }
}

# Limpiar archivo temporal
Remove-Item $tempFile -Force

Write-Host ""
Write-Host "🎉 ¡Configuración de Vercel completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Verificar en: https://vercel.com/[tu-proyecto]/settings/environment-variables" -ForegroundColor White
Write-Host "   2. Hacer un nuevo deploy para aplicar cambios: vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "💡 O configurar manualmente:" -ForegroundColor Cyan
Write-Host "   • Ve a: Vercel Dashboard → Settings → Environment Variables" -ForegroundColor Gray
Write-Host "   • Variable: GEMINI_API_KEY" -ForegroundColor Gray
Write-Host "   • Value: $GEMINI_KEY" -ForegroundColor Gray
Write-Host "   • Aplica a: Production, Preview, Development" -ForegroundColor Gray
Write-Host ""
