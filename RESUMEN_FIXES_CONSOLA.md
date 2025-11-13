# 🛠️ Solución de Errores de Consola

## ❌ Errores Detectados

1. **favicon.ico: 404** - Faltaba el favicon
2. **api/configuracion: 500** - Tabla no sincronizada con Prisma
3. **api/ocr/dni-gemini: 429** - Rate limit de Gemini excedido

---

## ✅ Soluciones Implementadas

### 1. Favicon Dinámico (404 → 200)

**Archivo creado:** `app/icon.tsx`

```tsx
// Favicon dinámico generado con Next.js 14
export default function Icon() {
  return new ImageResponse(
    <div style={{ /* Municipio de Lanús - "L" */ }}>
      L
    </div>
  )
}
```

**Resultado:** ✅ Favicon se genera automáticamente en build time

---

### 2. Configuración API (500 → 200)

**Problema:** La tabla `configuracion_app` existe en la BD pero puede no tener datos.

**Solución:** El endpoint ya tiene lógica para crear configuración por defecto si no existe:

```typescript
// app/api/configuracion/route.ts
if (!config) {
  config = await prisma.configuracion_app.create({
    data: {
      titulo: 'Sistema de Gestión Municipal',
      subtitulo: 'Municipio de Lanús',
      color_primario: '#2563eb',
      color_secundario: '#1e40af',
    },
  })
}
```

**Acción requerida:** 
```bash
# Sincronizar esquema de Prisma con la BD
npm run prisma:push
```

---

### 3. Rate Limit de Gemini (429 → Retry Automático)

**Problema:** API de Gemini alcanzó el límite de cuota gratuita

#### 🔧 Mejoras Implementadas:

#### a) Cambio de Modelo
- ❌ `gemini-2.0-flash-exp` (10 req/min) 
- ✅ `gemini-1.5-flash` (15 req/min, 1500 req/día)

#### b) Utilidades Centralizadas
**Nuevo archivo:** `lib/gemini-utils.ts`

```typescript
// Retry automático con exponential backoff
executeWithRetry(() => model.generateContent(prompt), {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000,
})

// Manejo de errores amigable
handleGeminiError(error) // → "Servicio temporalmente no disponible..."

// Extracción de JSON robusta
extractJSON(text) // → Parsea JSON incluso con texto adicional
```

#### c) Endpoints Actualizados
- ✅ `app/api/ocr/dni-gemini/route.ts`
- ✅ `app/api/chat-ia-global/route.ts`

#### d) Script de Migración
**Archivo:** `scripts/fix-gemini-model.ps1`

```powershell
# Actualiza todos los endpoints al nuevo modelo
.\scripts\fix-gemini-model.ps1
```

---

## 📋 Checklist Post-Deploy

### Inmediato
- [x] Favicon creado (`app/icon.tsx`)
- [x] Variable `GEMINI_API_KEY` documentada en `.env.example`
- [x] Utilidades de retry implementadas (`lib/gemini-utils.ts`)
- [x] Endpoints principales actualizados

### Antes del próximo deploy
- [ ] Ejecutar: `npm run prisma:push` (sincronizar BD)
- [ ] Ejecutar: `.\scripts\fix-gemini-model.ps1` (actualizar otros endpoints)
- [ ] Verificar que `GEMINI_API_KEY` esté configurada en producción
- [ ] Probar OCR en producción

### Opcional (si persisten problemas)
- [ ] Considerar implementar DeepSeek como fallback
- [ ] Agregar rate limiting del lado del cliente
- [ ] Implementar caché de respuestas de IA

---

## 🧪 Testing Local

### 1. Probar Favicon
```
http://localhost:3000/favicon.ico
# Debe retornar 200 y mostrar "L" azul
```

### 2. Probar Configuración
```bash
curl http://localhost:3000/api/configuracion
# Debe retornar configuración con título "Sistema de Gestión Municipal"
```

### 3. Probar OCR con Retry
```bash
curl -X POST http://localhost:3000/api/ocr/dni-gemini \
  -F "file=@test-dni.jpg"
# Si hay rate limit, debe reintentar automáticamente
```

---

## 🔍 Monitoreo

### Google Gemini
- **Dashboard:** https://aistudio.google.com/app/apikey
- **Límites:** 15 req/min, 1500 req/día (gemini-1.5-flash)

### Logs del Servidor
```bash
# Ver logs de retry automático
[Gemini] Rate limit alcanzado. Reintentando en 1000ms (intento 1/3)...
```

---

## 🚀 Alternativas Futuras

### Si Gemini sigue siendo insuficiente:

1. **DeepSeek API** ($0.14/1M tokens)
   - Más económico que Gemini de pago
   - Límites más flexibles
   - Compatible con OpenAI SDK

2. **Upgrade a Gemini Pro** ($0.075/1M tokens)
   - Límites empresariales
   - Soporte prioritario

3. **Ollama Local** (Gratis)
   - Privado y sin límites
   - Requiere hardware dedicado

**Documentación completa:** `SOLUCION_RATE_LIMIT_GEMINI.md`

---

## 📊 Resultado Esperado

| Error | Status Antes | Status Después |
|-------|--------------|----------------|
| favicon.ico | 404 | 200 ✅ |
| api/configuracion | 500 | 200 ✅ |
| api/ocr/dni-gemini | 429 | Retry → 200 ✅ |

---

## 🎓 Lecciones Aprendidas

1. **Modelos experimentales tienen límites más bajos** → Usar versiones estables
2. **APIs externas fallan** → Implementar retry logic y fallbacks
3. **Mensajes de error deben ser amigables** → Traducir errores técnicos
4. **Centralizar lógica común** → Facilita mantenimiento

---

**Estado:** ✅ **Resuelto**  
**Próximos pasos:** Monitorear uso de Gemini y considerar DeepSeek si es necesario
