# ✅ Solución al Error 429 - Rate Limit de Gemini

## 🔥 Problema Resuelto

**Error anterior:**
```
[429 Too Many Requests] You exceeded your current quota
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
```

## 🛠️ Mejoras Implementadas

### 1. **Cambio de Modelo**
- ❌ Antes: `gemini-2.0-flash-exp` (límites experimentales bajos)
- ✅ Ahora: `gemini-1.5-flash` (15 req/min, 1500 req/día)

### 2. **Retry Logic Automático**
```typescript
// Reintentos automáticos con exponential backoff
executeWithRetry(() => model.generateContent(prompt), {
  maxRetries: 3,
  initialDelay: 1000,  // 1 segundo
  maxDelay: 5000,      // 5 segundos máximo
})
```

### 3. **Manejo de Errores Mejorado**
- Mensajes amigables para el usuario
- Detección inteligente de errores de cuota
- Sugerencias de retry cuando es posible

### 4. **Utilidades Centralizadas**
Nuevo archivo: `lib/gemini-utils.ts`
- `executeWithRetry()` - Reintentos automáticos
- `handleGeminiError()` - Manejo de errores
- `extractJSON()` - Extracción de JSON limpia
- `getGeminiVisionModel()` - Modelo optimizado para OCR
- `getGeminiChatModel()` - Modelo optimizado para chat

## 📊 Límites de Gemini Gratuito

| Modelo | Requests/Minuto | Requests/Día | Tokens/Minuto |
|--------|----------------|--------------|---------------|
| **gemini-1.5-flash** ✅ | 15 | 1,500 | 1,000,000 |
| gemini-1.5-pro | 2 | 50 | 32,000 |
| gemini-2.0-flash-exp ⚠️ | 10 | 1,000 | 500,000 |

## 🚀 Alternativa: DeepSeek (Próxima Implementación)

Si Gemini sigue teniendo problemas, podemos integrar **DeepSeek** como fallback:

### ✅ Ventajas de DeepSeek
1. **Más económico**: $0.14/1M tokens (input)
2. **Sin límites tan restrictivos**: 100+ req/min
3. **Razonamiento complejo**: Mejor para validaciones
4. **Compatible con OpenAI SDK**: Fácil integración

### 📝 Plan de Implementación

```typescript
// lib/ai-provider.ts (próximamente)
async function processWithFallback(prompt: string) {
  try {
    // Intentar con Gemini primero (gratis)
    return await geminiProcess(prompt)
  } catch (error) {
    if (isRateLimit(error)) {
      // Fallback a DeepSeek si Gemini falla
      console.log('🔄 Fallback a DeepSeek...')
      return await deepseekProcess(prompt)
    }
    throw error
  }
}
```

### 🔧 Configuración DeepSeek

```bash
# Instalar SDK
npm install openai
```

```env
# .env.local
DEEPSEEK_API_KEY="sk-xxx"  # Obtener en: https://platform.deepseek.com
```

```typescript
// lib/deepseek.ts
import OpenAI from 'openai'

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'
})

export async function ocrWithDeepSeek(imageBase64: string) {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'Eres un experto en OCR...' },
      { 
        role: 'user', 
        content: [
          { type: 'text', text: 'Extrae datos del DNI:' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` }}
        ]
      }
    ]
  })
  return response.choices[0].message.content
}
```

## 🎯 Casos de Uso Recomendados

### Usar Gemini (Gratis)
- ✅ OCR de documentos (DNI, cédula, póliza)
- ✅ Chat básico de ayuda
- ✅ Extracción de datos simples
- ✅ Desarrollo y testing

### Usar DeepSeek (Pago pero económico)
- ✅ Validación cruzada de documentos
- ✅ Análisis complejo de inspecciones
- ✅ Generación de resoluciones legales
- ✅ Detección de inconsistencias
- ✅ Producción con alto tráfico

## 📈 Monitoreo de Uso

**Google AI Studio:**
- https://aistudio.google.com/app/apikey
- Ver uso actual y límites

**DeepSeek Dashboard (si implementamos):**
- https://platform.deepseek.com/usage

## 🔍 Testing

```bash
# Probar OCR con Gemini mejorado
curl -X POST http://localhost:3000/api/ocr/dni-gemini \
  -F "file=@dni.jpg"

# Probar chat IA
curl -X POST http://localhost:3000/api/chat-ia-global \
  -H "Content-Type: application/json" \
  -d '{"pregunta":"¿Cómo generar una credencial?"}'
```

## 🎓 Mejores Prácticas

1. **Rate Limiting del Cliente**
   - No enviar múltiples requests simultáneos
   - Debounce en inputs de usuario
   - Cachear respuestas cuando posible

2. **Fallback Manual**
   - Si OCR falla, permitir entrada manual
   - Mostrar nivel de confianza al usuario

3. **Monitoreo**
   - Logs de uso de IA
   - Alertas cuando se acerca al límite

## 📞 ¿Necesitas Más Capacidad?

### Opción 1: Upgrade Gemini (Pago)
- $0.075/1M tokens (input)
- $0.30/1M tokens (output)
- Límites mucho mayores

### Opción 2: Implementar DeepSeek
- Más económico que Gemini de pago
- Sin límites estrictos de tier gratuito
- Mejor para producción

### Opción 3: Ollama Local (Gratis pero requiere hardware)
```bash
# Correr localmente (privado y gratis)
ollama pull deepseek-r1:latest
ollama serve
```

---

**Estado:** ✅ Resuelto con retry logic + modelo optimizado  
**Próximos pasos:** Implementar DeepSeek como fallback si es necesario
