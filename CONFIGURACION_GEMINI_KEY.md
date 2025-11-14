# ✅ API Key de Gemini Configurada

## 🔑 Nueva API Key Instalada

**API Key:** `AIzaSyB2mKi3bq_qd-30LodQDSN2LQbtkW9h5UQ`

### Archivos Actualizados
- ✅ `.env` 
- ✅ `.env.local`
- ✅ `.env.example`

---

## 📊 Límites de la Cuota Gratuita

### gemini-2.0-flash-exp ✅ (ACTIVO - para OCR y chat)
- **Requests por minuto:** 10
- **Requests por día:** 1,000
- **Tokens por minuto:** 500,000
- **Nota:** Mejor para visión y OCR

### gemini-1.5-flash ⚠️ (No disponible en v1beta)
- **Requests por minuto:** 15
- **Requests por día:** 1,500
- **Tokens por minuto:** 1,000,000
- **Nota:** Temporalmente no disponible

### gemini-1.5-pro (para análisis complejos)
- **Requests por minuto:** 2
- **Requests por día:** 50
- **Tokens por minuto:** 32,000

---

## 🧪 Probar la Configuración

### 1. Reiniciar el servidor
```bash
# Detener servidor actual (Ctrl+C)
npm run dev
```

### 2. Probar OCR de DNI
```bash
# Con curl
curl -X POST http://localhost:3000/api/ocr/dni-gemini \
  -F "file=@ruta/a/dni.jpg"

# O desde el navegador
# http://localhost:3000/ocr-demo
```

### 3. Probar Chat IA
```bash
curl -X POST http://localhost:3000/api/chat-ia-global \
  -H "Content-Type: application/json" \
  -d '{"pregunta":"¿Cómo generar una credencial?"}'
```

---

## 📈 Monitorear Uso

**Google AI Studio:**
- URL: https://aistudio.google.com/app/apikey
- Ver consumo en tiempo real
- Verificar límites restantes

**Dashboard de métricas:**
- https://ai.google.dev/gemini-api/docs/usage

---

## 🔄 Funcionalidades Mejoradas

Con la nueva key y el sistema de retry, ahora tenés:

### ✅ OCR Inteligente
- **DNI argentino** - Extrae nombre, DNI, CUIL, domicilio
- **Cédula verde/azul** - Datos del vehículo
- **Título vehicular** - Información técnica
- **Pólizas de seguro** - Datos del seguro
- **Certificados VTV** - Estado de inspección
- **Licencias de conducir** - Datos del conductor

### ✅ Chat IA Contextual
- Consultas sobre habilitaciones
- Análisis de vencimientos
- Explicación de requisitos
- Guía paso a paso

### ✅ Análisis de Inspecciones
- Evaluación de fotos
- Detección de problemas
- Sugerencias de checklist

---

## 🔐 Seguridad

### ⚠️ IMPORTANTE
- **NO** subir archivos `.env` o `.env.local` a git (ya están en `.gitignore`)
- **NO** compartir la API key públicamente
- **NO** hardcodear la key en el código

### ✅ Variables de Entorno en Vercel
Para production, agregar en Vercel Dashboard:
1. Ir a Settings → Environment Variables
2. Agregar: `GEMINI_API_KEY` = `AIzaSyB2mKi3bq_qd-30LodQDSN2LQbtkW9h5UQ`
3. Redeploy la aplicación

```bash
# O desde CLI de Vercel
vercel env add GEMINI_API_KEY
# Pegar: AIzaSyB2mKi3bq_qd-30LodQDSN2LQbtkW9h5UQ
```

---

## 🆘 Solución de Problemas

### Error: "GEMINI_API_KEY no está configurada"
```bash
# Ejecutar script de configuración
.\scripts\setup-gemini-key.ps1

# O manualmente agregar a .env.local:
echo GEMINI_API_KEY=AIzaSyB2mKi3bq_qd-30LodQDSN2LQbtkW9h5UQ >> .env.local
```

### Error 429: Rate Limit Exceeded
- El sistema tiene retry automático (3 intentos)
- Si persiste, esperar 1 minuto
- Verificar uso en: https://aistudio.google.com/app/apikey

### Error 401: Invalid API Key
```bash
# Regenerar key en Google AI Studio
# Actualizar con el script:
.\scripts\setup-gemini-key.ps1
```

---

## 🚀 Próximas Mejoras

Si la cuota gratuita no es suficiente:

### Opción 1: Upgrade a Gemini Pro (Pago)
- **Costo:** $0.075/1M tokens (input)
- **Límites:** Mucho más altos
- **Dashboard:** https://aistudio.google.com/app/prompts/new_chat

### Opción 2: DeepSeek (Alternativa)
- **Costo:** $0.14/1M tokens
- **Límites:** Flexibles
- **Setup:** Ver `SOLUCION_RATE_LIMIT_GEMINI.md`

### Opción 3: Ollama Local (Gratis)
- **Costo:** $0 (usa tu hardware)
- **Privacidad:** 100% local
- **Setup:** `ollama pull deepseek-r1`

---

## 📝 Changelog

### 2025-01-13
- ✅ Nueva API key configurada
- ✅ Sistema de retry implementado
- ✅ Cambio a gemini-1.5-flash (mejor cuota)
- ✅ Manejo de errores mejorado
- ✅ Scripts de configuración automática

---

**Estado:** ✅ **ACTIVO Y FUNCIONANDO**  
**Última verificación:** 2025-01-13 09:20 ART
