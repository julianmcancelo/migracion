# 📚 Guía de Mejores Prácticas

## Sistema de Credenciales - Municipio de Lanús

Esta guía establece las mejores prácticas para el desarrollo y mantenimiento del proyecto.

---

## 📝 1. LOGGING Y DEBUGGING

### ❌ EVITAR

```typescript
console.log('Usuario:', user)
console.error('Error:', error)
```

### ✅ USAR

```typescript
import { logger } from '@/lib/logger'

logger.info('Usuario autenticado', { userId: user.id, email: user.email })
logger.error('Error al crear habilitación', error)
logger.debug('Query ejecutada', { query: habilitacion })
```

**Beneficios:**

- Logs estructurados
- Control por ambiente (dev/prod)
- Preparado para integración con Sentry
- Mejor debugging

---

## 🔒 2. API ROUTES

### ❌ EVITAR

```typescript
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await prisma.habilitaciones.create({ data })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
```

### ✅ USAR

```typescript
import { ApiResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic' // Si necesita datos frescos

const schema = z.object({
  nro_licencia: z.string().min(1),
  tipo_transporte: z.enum(['Escolar', 'Remis']),
})

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    // 1. Validar autenticación
    const session = await getSession()
    if (!session) {
      return ApiResponse.unauthorized()
    }

    // 2. Validar permisos
    if (session.rol === 'lector') {
      return ApiResponse.forbidden('No tiene permisos para crear habilitaciones')
    }

    // 3. Validar datos de entrada
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return ApiResponse.validationError(result.error.errors)
    }

    // 4. Ejecutar operación
    const habilitacion = await prisma.habilitaciones_generales.create({
      data: result.data,
    })

    // 5. Log de éxito
    logger.success('Habilitación creada', { id: habilitacion.id })
    logger.perf('POST /api/habilitaciones', startTime)

    // 6. Respuesta
    return ApiResponse.created(habilitacion, 'Habilitación creada exitosamente')
  } catch (error) {
    return ApiResponse.serverError('Error al crear habilitación', error)
  }
}
```

**Beneficios:**

- Respuestas consistentes
- Validación de entrada
- Logging automático
- Mejor manejo de errores
- Type-safe

---

## 🎯 3. TYPE SAFETY

### ❌ EVITAR

```typescript
const habilitaciones = await prisma.habilitaciones_generales.findMany({
  include: {
    habilitaciones_personas: { include: { persona: true } },
  },
} as any) // ❌ Casting a any
```

### ✅ USAR

```typescript
import type { HabilitacionConRelaciones } from '@/lib/prisma-types'

const habilitaciones: HabilitacionConRelaciones[] = await prisma.habilitaciones_generales.findMany({
  include: {
    habilitaciones_personas: { include: { persona: true } },
    habilitaciones_vehiculos: { include: { vehiculo: true } },
    habilitaciones_establecimientos: true,
    habilitaciones_documentos: true,
  },
})

// TypeScript conoce la estructura completa
habilitaciones.forEach(hab => {
  console.log(hab.habilitaciones_personas[0].persona.nombre) // ✅ Type-safe
})
```

**Beneficios:**

- IntelliSense completo
- Detección temprana de errores
- Refactoring seguro
- Mejor documentación

---

## ⚡ 4. PERFORMANCE

### Optimizar Queries

#### ❌ EVITAR (Over-fetching)

```typescript
// Trae TODOS los campos y relaciones
const habilitaciones = await prisma.habilitaciones_generales.findMany({
  include: {
    habilitaciones_personas: { include: { persona: true } },
    habilitaciones_vehiculos: { include: { vehiculo: true } },
    habilitaciones_establecimientos: true,
  },
})
```

#### ✅ USAR (Solo lo necesario)

```typescript
// Para listados: Solo campos esenciales
const habilitaciones = await prisma.habilitaciones_generales.findMany({
  select: {
    id: true,
    nro_licencia: true,
    estado: true,
    habilitaciones_personas: {
      where: { rol: 'TITULAR' },
      take: 1,
      select: {
        persona: {
          select: { nombre: true },
        },
      },
    },
  },
})
```

### Implementar Caché

```typescript
import { unstable_cache } from 'next/cache'

export const getStats = unstable_cache(
  async () => {
    return await prisma.habilitaciones_generales.count()
  },
  ['dashboard-stats'],
  { revalidate: 300 } // 5 minutos
)
```

### Server vs Client Components

```typescript
// ✅ Server Component (default) - Sin "use client"
// Para páginas que solo muestran datos
export default async function HabilitacionesPage() {
  const habilitaciones = await getHabilitaciones()
  return <HabilitacionesList data={habilitaciones} />
}

// ✅ Client Component - Con "use client"
// Solo cuando necesitas interactividad
'use client'
export function HabilitacionesList({ data }) {
  const [filter, setFilter] = useState('')
  // ... interactividad
}
```

---

## 🧪 5. VALIDACIÓN

### Usar Zod para todas las entradas

```typescript
import { z } from 'zod'

// Definir schemas reutilizables
export const habilitacionSchema = z.object({
  nro_licencia: z.string().min(1, 'Requerido'),
  tipo_transporte: z.enum(['Escolar', 'Remis', 'Demo']),
  vigencia_inicio: z.coerce.date().optional(),
  vigencia_fin: z.coerce.date().optional(),
  personas: z
    .array(
      z.object({
        persona_id: z.number(),
        rol: z.enum(['TITULAR', 'CONDUCTOR', 'CHOFER', 'CELADOR']),
      })
    )
    .min(1, 'Debe tener al menos una persona'),
})

// Validar en API
const result = habilitacionSchema.safeParse(body)
if (!result.success) {
  return ApiResponse.validationError(result.error.errors)
}
```

---

## 🎨 6. COMPONENTES

### Estructura de componentes

```typescript
/**
 * Descripción del componente
 *
 * @param props - Descripción de las props
 * @example
 * <HabilitacionCard habilitacion={hab} />
 */

import type { HabilitacionFormateada } from '@/lib/prisma-types'

interface HabilitacionCardProps {
  habilitacion: HabilitacionFormateada
  onEdit?: (id: number) => void
  className?: string
}

export function HabilitacionCard({
  habilitacion,
  onEdit,
  className
}: HabilitacionCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      {/* Contenido */}
    </Card>
  )
}
```

### Separar lógica de UI

```typescript
// hooks/use-habilitaciones.ts
export function useHabilitaciones(tipo: string) {
  const [data, setData] = useState<HabilitacionFormateada[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHabilitaciones(tipo)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [tipo])

  return { data, loading, error }
}

// Component
export function HabilitacionesList() {
  const { data, loading, error } = useHabilitaciones('Escolar')

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorMessage error={error} />

  return <Table data={data} />
}
```

---

## 🔐 7. SEGURIDAD

### Validar en servidor siempre

```typescript
// ❌ NUNCA confiar solo en validación de cliente
// ✅ SIEMPRE validar en servidor

export async function POST(request: Request) {
  // 1. Autenticación
  const session = await getSession()
  if (!session) {
    return ApiResponse.unauthorized()
  }

  // 2. Autorización
  if (!canUserPerformAction(session.rol, 'create_habilitacion')) {
    return ApiResponse.forbidden()
  }

  // 3. Validación de datos
  const result = schema.safeParse(body)
  if (!result.success) {
    return ApiResponse.validationError(result.error)
  }

  // 4. Sanitización
  const cleanData = sanitizeInput(result.data)

  // 5. Operación
  // ...
}
```

### Proteger información sensible

```typescript
// ❌ NO exponer información sensible
return ApiResponse.success({
  user: {
    password: user.password, // ❌ NUNCA
    email: user.email,
  },
})

// ✅ Omitir campos sensibles
return ApiResponse.success({
  user: {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    // password omitido
  },
})
```

---

## 📦 8. ESTRUCTURA DE ARCHIVOS

```
proyecto/
├── app/
│   ├── (auth)/              # Rutas públicas (login)
│   ├── (panel)/             # Rutas protegidas
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Server Component
│   │   │   └── _components/        # Componentes específicos
│   │   └── habilitaciones/
│   │       ├── page.tsx
│   │       └── _components/
│   └── api/
│       └── habilitaciones/
│           └── route.ts
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Header, Sidebar, etc.
│   └── shared/              # Componentes compartidos
├── lib/
│   ├── auth.ts             # Lógica de autenticación
│   ├── db.ts               # Cliente Prisma
│   ├── logger.ts           # Sistema de logging ✅
│   ├── api-response.ts     # Respuestas API ✅
│   ├── prisma-types.ts     # Tipos Prisma ✅
│   ├── utils.ts            # Utilidades generales
│   └── validations/        # Schemas Zod
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript types globales
└── prisma/
    └── schema.prisma
```

---

## 🧹 9. CÓDIGO LIMPIO

### Nombres descriptivos

```typescript
// ❌ Evitar
const h = await getH()
const d = new Date()

// ✅ Usar
const habilitacion = await getHabilitacion()
const currentDate = new Date()
```

### Funciones pequeñas

```typescript
// ❌ Función que hace demasiado
async function processHabilitacion(data) {
  // Validar
  // Crear habilitación
  // Vincular personas
  // Vincular vehículos
  // Enviar email
  // Generar PDF
  // ... 200 líneas
}

// ✅ Dividir en funciones pequeñas
async function createHabilitacion(data) {
  const validated = validateData(data)
  const habilitacion = await saveHabilitacion(validated)
  await linkRelations(habilitacion.id, data)
  await notifyCreation(habilitacion)
  return habilitacion
}
```

### Comentarios útiles

```typescript
// ❌ Comentarios obvios
const total = a + b // Suma a y b

// ✅ Comentarios que explican el "por qué"
// Usar COALESCE porque la BD tiene valores NULL legacy
const query = 'SELECT COALESCE(nombre, "Sin nombre") as nombre'

// ✅ Documentar funciones complejas
/**
 * Calcula la vigencia de una habilitación basándose en reglas de negocio:
 * - Escolar: 1 año desde emisión
 * - Remis: 6 meses desde emisión
 * - Demo: 30 días desde emisión
 */
function calcularVigencia(tipo: TipoTransporte): Date {
  // ...
}
```

---

## 📈 10. MONITORING

### Implementar tracking de performance

```typescript
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    const data = await fetchData()

    // Log de performance
    logger.perf('GET /api/habilitaciones', startTime)

    return ApiResponse.success(data)
  } catch (error) {
    return ApiResponse.error('Error', 500, error)
  }
}
```

### Preparar para Sentry

```typescript
// lib/monitoring.ts (para futuro)
import * as Sentry from '@sentry/nextjs'

export function initMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.VERCEL_ENV || 'development',
    })
  }
}

// Usar en layout.tsx o en API routes críticas
```

---

## ✅ CHECKLIST ANTES DE COMMIT

- [ ] No hay `console.log` directo (usar `logger`)
- [ ] No hay tipos `any` innecesarios
- [ ] Validación Zod en APIs
- [ ] Manejo de errores con `ApiResponse`
- [ ] Comentarios en funciones complejas
- [ ] Tests actualizados (si aplica)
- [ ] Sin errores de TypeScript (`npm run type-check`)
- [ ] Sin errores de ESLint (`npm run lint`)

---

## 📚 RECURSOS ADICIONALES

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Zod Documentation](https://zod.dev/)

---

**Última actualización:** Enero 2025  
**Próxima revisión:** Cada sprint (2 semanas)
