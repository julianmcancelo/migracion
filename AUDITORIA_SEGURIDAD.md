# 🔒 AUDITORÍA DE SEGURIDAD Y CIBERSEGURIDAD

**Fecha:** 19 de Noviembre de 2025  
**Proyecto:** Sistema de Gestión de Transporte - Next.js  
**Estado:** Auditoría Completa

---

## 📊 RESUMEN EJECUTIVO

### ✅ Fortalezas Identificadas
- ✅ Autenticación con JWT implementada correctamente
- ✅ Cookies HTTP-only para sesiones
- ✅ Middleware de protección de rutas funcional
- ✅ Uso de Prisma ORM (previene SQL injection)
- ✅ Validación con Zod en endpoints críticos
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Variables de entorno para secretos

### ⚠️ Vulnerabilidades Críticas Encontradas
1. **🔴 CRÍTICO:** Credenciales expuestas en `.env.example`
2. **🔴 CRÍTICO:** JWT_SECRET débil y expuesto
3. **🔴 CRÍTICO:** API Keys públicas en repositorio
4. **🟡 ALTO:** Falta de rate limiting
5. **🟡 ALTO:** Headers de seguridad incompletos
6. **🟡 ALTO:** Falta validación de tamaño de archivos
7. **🟠 MEDIO:** TypeScript build errors ignorados
8. **🟠 MEDIO:** Falta CORS configurado explícitamente
9. **🟠 MEDIO:** Logs con información sensible

---

## 🔴 VULNERABILIDADES CRÍTICAS

### 1. Credenciales Expuestas en Repositorio

**Archivo:** `.env.example`, `.env.local`

**Problema:**
```env
# ❌ EXPUESTO EN REPOSITORIO
DATABASE_URL="mysql://transpo1_credenciales:feelthesky1@167.250.5.55:3306/transpo1_credenciales"
JWT_SECRET="mHMSw4elmNvo4n9qRu3gBEP1Acv3ksXrGVJl7ZYiVkU="
GOOGLE_MAPS_API_KEY="AIzaSyAYpg-lZ_qGsOPV-veIp9Mnv36NHU1Ib-A"
GEMINI_API_KEY="AIzaSyB2mKi3bq_qd-30LodQDSN2LQbtkW9h5UQ"
```

**Riesgo:**
- Acceso completo a la base de datos de producción
- Posible robo de datos sensibles
- Uso no autorizado de APIs (costos)
- Compromiso total del sistema

**Solución Inmediata:**
1. ✅ Rotar TODAS las credenciales inmediatamente
2. ✅ Cambiar contraseña de MySQL
3. ✅ Regenerar JWT_SECRET
4. ✅ Regenerar API Keys de Google Maps y Gemini
5. ✅ Eliminar archivos `.env.local` del repositorio
6. ✅ Actualizar `.gitignore`

---

### 2. JWT Secret Débil

**Archivo:** `lib/auth.ts`, `middleware.ts`

**Problema:**
```typescript
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)
```

**Riesgos:**
- Fallback secret predecible
- JWT_SECRET actual puede ser débil
- Posible falsificación de tokens

**Solución:**
```typescript
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no configurado - Sistema detenido por seguridad')
}
```

---

### 3. API Keys Públicas

**Problema:**
- Google Maps API Key expuesta en cliente
- Gemini API Key en variables de entorno públicas

**Solución:**
- Restringir API Keys por dominio/IP en Google Cloud Console
- Implementar proxy para llamadas a Gemini
- Usar variables `NEXT_PUBLIC_` solo cuando sea absolutamente necesario

---

## 🟡 VULNERABILIDADES DE ALTO RIESGO

### 4. Falta de Rate Limiting

**Problema:**
- Sin protección contra ataques de fuerza bruta
- Sin límite de requests por IP
- Vulnerable a DDoS

**Endpoints Críticos:**
- `/api/auth/login`
- `/api/auth/login-inspector`
- `/api/ai/ocr-*`
- `/api/chat-ia-global`

**Solución:**
Implementar rate limiting con `@upstash/ratelimit` o similar:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 intentos por minuto
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Intenta más tarde.' },
      { status: 429 }
    )
  }
  // ... resto del código
}
```

---

### 5. Headers de Seguridad Incompletos

**Archivo:** `next.config.js`

**Problema:**
Faltan headers críticos de seguridad

**Solución:**
```javascript
headers: async () => [
  {
    source: '/:path*',
    headers: [
      // Prevenir clickjacking
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      // Prevenir MIME sniffing
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      // Protección XSS
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      // Referrer Policy
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      // Permissions Policy
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(self)',
      },
      // Content Security Policy
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: https: blob:",
          "font-src 'self' https://fonts.gstatic.com",
          "connect-src 'self' https://maps.googleapis.com https://generativelanguage.googleapis.com",
          "frame-src 'none'",
        ].join('; '),
      },
      // HSTS (solo en producción)
      ...(process.env.NODE_ENV === 'production' ? [{
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      }] : []),
    ],
  },
]
```

---

### 6. Validación de Archivos Insuficiente

**Problema:**
Falta validación de:
- Tamaño máximo de archivos
- Tipos MIME permitidos
- Nombres de archivo maliciosos
- Contenido de archivos

**Archivos Afectados:**
- `/api/ai/ocr-*`
- `/api/paradas/upload-excel`
- Cualquier endpoint con `formData`

**Solución:**
```typescript
// Crear middleware de validación
export async function validateFileUpload(
  file: File,
  options: {
    maxSize?: number // bytes
    allowedTypes?: string[]
    allowedExtensions?: string[]
  }
) {
  const maxSize = options.maxSize || 10 * 1024 * 1024 // 10MB default
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'application/pdf']
  
  // Validar tamaño
  if (file.size > maxSize) {
    throw new Error(`Archivo muy grande. Máximo: ${maxSize / 1024 / 1024}MB`)
  }
  
  // Validar tipo MIME
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido: ${file.type}`)
  }
  
  // Validar extensión
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (options.allowedExtensions && !options.allowedExtensions.includes(extension || '')) {
    throw new Error(`Extensión no permitida: ${extension}`)
  }
  
  // Sanitizar nombre de archivo
  const safeName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 255)
  
  return { ...file, name: safeName }
}
```

---

## 🟠 VULNERABILIDADES DE RIESGO MEDIO

### 7. TypeScript Build Errors Ignorados

**Archivo:** `next.config.js`

**Problema:**
```javascript
typescript: {
  ignoreBuildErrors: true, // ❌ PELIGROSO
}
```

**Riesgo:**
- Errores de tipo no detectados
- Bugs en producción
- Vulnerabilidades no evidentes

**Solución:**
```javascript
typescript: {
  ignoreBuildErrors: false, // ✅ Corregir errores
}
```

---

### 8. CORS No Configurado

**Problema:**
Sin configuración explícita de CORS, puede permitir requests de cualquier origen

**Solución:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Configurar CORS solo para dominios permitidos
  const allowedOrigins = [
    'https://lanus.digital',
    'https://credenciales.transportelanus.com.ar',
  ]
  
  const origin = request.headers.get('origin')
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  return response
}
```

---

### 9. Logs con Información Sensible

**Problema:**
```typescript
console.log('Respuesta de Gemini:', responseText) // ❌ Puede contener datos sensibles
console.error('Error en login:', error) // ❌ Puede exponer stack traces
```

**Solución:**
```typescript
// Crear logger seguro
import pino from 'pino'

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: ['password', 'token', 'apiKey', 'secret'],
})

// Usar en lugar de console.log
logger.info({ event: 'ocr_success' }, 'OCR procesado')
logger.error({ err: error.message }, 'Error en login')
```

---

## 🔐 MEJORES PRÁCTICAS ADICIONALES

### 10. Validación de Input

**Implementar en TODOS los endpoints:**

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
})

export async function POST(request: Request) {
  const body = await request.json()
  
  // Validar
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: result.error.errors },
      { status: 400 }
    )
  }
  
  // Usar datos validados
  const { email, password } = result.data
}
```

---

### 11. Sanitización de Datos

```typescript
import DOMPurify from 'isomorphic-dompurify'

// Para contenido HTML
const cleanHTML = DOMPurify.sanitize(userInput)

// Para SQL (Prisma ya lo hace, pero por si acaso)
const cleanString = userInput
  .replace(/[^\w\s-]/gi, '')
  .trim()
  .substring(0, 255)
```

---

### 12. Sesiones Seguras

**Mejorar configuración de cookies:**

```typescript
cookieStore.set('session', token, {
  httpOnly: true,
  secure: true, // ✅ Siempre HTTPS en producción
  sameSite: 'strict', // ✅ Cambiar de 'lax' a 'strict'
  maxAge: SESSION_DURATION / 1000,
  path: '/',
  domain: process.env.NODE_ENV === 'production' 
    ? '.lanus.digital' 
    : undefined,
})
```

---

### 13. Protección contra CSRF

Next.js tiene protección integrada, pero asegurar:

```typescript
// Verificar origin en requests críticos
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const allowedOrigins = ['https://lanus.digital']
  
  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json(
      { error: 'Origen no permitido' },
      { status: 403 }
    )
  }
}
```

---

### 14. Encriptación de Datos Sensibles

```typescript
import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  }
}

export function decrypt(encrypted: string, iv: string, authTag: string) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, 'hex')
  )
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

---

### 15. Auditoría y Logging

```typescript
// Crear tabla de auditoría
model audit_log {
  id         Int      @id @default(autoincrement())
  user_id    Int?
  action     String   @db.VarChar(100)
  entity     String   @db.VarChar(50)
  entity_id  Int?
  ip_address String?  @db.VarChar(45)
  user_agent String?  @db.Text
  timestamp  DateTime @default(now())
  details    Json?
}

// Middleware de auditoría
export async function auditLog(
  userId: number | null,
  action: string,
  entity: string,
  entityId: number | null,
  request: Request
) {
  await prisma.audit_log.create({
    data: {
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    },
  })
}
```

---

## 📋 CHECKLIST DE SEGURIDAD

### Antes de Publicar

- [ ] Rotar TODAS las credenciales
- [ ] Generar nuevo JWT_SECRET (mínimo 256 bits)
- [ ] Regenerar API Keys y restringir por dominio
- [ ] Eliminar `.env.local` del repositorio
- [ ] Verificar `.gitignore` incluye todos los archivos sensibles
- [ ] Implementar rate limiting en endpoints críticos
- [ ] Agregar headers de seguridad
- [ ] Configurar CORS correctamente
- [ ] Habilitar HTTPS/SSL
- [ ] Configurar firewall de base de datos
- [ ] Implementar validación de archivos
- [ ] Corregir errores de TypeScript
- [ ] Configurar logging seguro
- [ ] Implementar monitoreo de seguridad
- [ ] Realizar backup de base de datos
- [ ] Documentar procedimientos de seguridad
- [ ] Capacitar al equipo en seguridad

### Configuración de Producción

```env
# .env.production (NUNCA commitear)

# Base de datos - IP restringida por firewall
DATABASE_URL="mysql://user_prod:NUEVA_PASSWORD_FUERTE@IP_PRIVADA:3306/db_prod"

# JWT Secret - Generar con: openssl rand -base64 64
JWT_SECRET="NUEVO_SECRET_SUPER_LARGO_Y_ALEATORIO_MINIMO_256_BITS"

# Encryption Key - Generar con: openssl rand -hex 32
ENCRYPTION_KEY="64_CARACTERES_HEXADECIMALES_ALEATORIOS"

# URLs
NEXT_PUBLIC_APP_URL="https://lanus.digital"

# API Keys - Restringidas por dominio
GOOGLE_MAPS_API_KEY="NUEVA_KEY_RESTRINGIDA"
GEMINI_API_KEY="NUEVA_KEY_RESTRINGIDA"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="transportepublicolanus@gmail.com"
EMAIL_PASS="APP_PASSWORD_DE_GMAIL"

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Monitoring
SENTRY_DSN="https://..."
```

---

## 🛡️ HERRAMIENTAS RECOMENDADAS

### Seguridad
- **Helmet.js** - Headers de seguridad
- **@upstash/ratelimit** - Rate limiting
- **Sentry** - Monitoreo de errores
- **Snyk** - Escaneo de vulnerabilidades
- **OWASP ZAP** - Testing de seguridad

### Validación
- **Zod** - Ya implementado ✅
- **DOMPurify** - Sanitización HTML
- **validator.js** - Validaciones adicionales

### Logging
- **Pino** - Logger de alto rendimiento
- **Winston** - Logger alternativo
- **Morgan** - HTTP request logger

---

## 📊 NIVEL DE RIESGO ACTUAL

```
🔴 CRÍTICO:  3 vulnerabilidades
🟡 ALTO:     3 vulnerabilidades
🟠 MEDIO:    3 vulnerabilidades
🟢 BAJO:     Sistema base sólido

SCORE TOTAL: 6/10 (Necesita mejoras urgentes)
```

---

## 🎯 PLAN DE ACCIÓN INMEDIATO

### Fase 1: Emergencia (HOY)
1. Rotar credenciales de base de datos
2. Generar nuevo JWT_SECRET
3. Regenerar API Keys
4. Eliminar archivos sensibles del repo
5. Actualizar `.gitignore`

### Fase 2: Crítico (Esta Semana)
1. Implementar rate limiting
2. Agregar headers de seguridad
3. Configurar validación de archivos
4. Corregir TypeScript errors
5. Implementar CORS

### Fase 3: Mejoras (Próximo Mes)
1. Implementar logging seguro
2. Agregar auditoría
3. Configurar monitoreo
4. Testing de seguridad
5. Documentación completa

---

## 📞 CONTACTO DE SEGURIDAD

Para reportar vulnerabilidades:
- Email: seguridad@lanus.gob.ar
- Proceso: Responsible Disclosure

---

**Última actualización:** 19 de Noviembre de 2025  
**Próxima auditoría:** Después de implementar correcciones
