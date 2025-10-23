# 🔄 Ejemplo: Migración de API a Mejores Prácticas

Este documento muestra cómo migrar una API existente para usar las nuevas utilidades.

---

## ANTES (Versión Original)

```typescript
// app/api/habilitaciones/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get('tipo') || 'Escolar'

    const habilitaciones = await prisma.habilitaciones_generales.findMany({
      where: {
        tipo_transporte: tipo,
        is_deleted: false,
      },
      include: {
        habilitaciones_personas: { include: { persona: true } },
        habilitaciones_vehiculos: { include: { vehiculo: true } },
      },
    } as any) // ❌ Usando any

    console.log('Habilitaciones:', habilitaciones) // ❌ Console.log directo

    return NextResponse.json({
      success: true,
      data: habilitaciones,
    })
  } catch (error: any) {
    console.error('Error:', error) // ❌ Console.error directo
    return NextResponse.json({ error: 'Error al obtener habilitaciones' }, { status: 500 })
  }
}
```

---

## DESPUÉS (Versión Mejorada)

```typescript
// app/api/habilitaciones/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { ApiResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'
import type { HabilitacionConRelaciones, HabilitacionFormateada } from '@/lib/prisma-types'
import { z } from 'zod'

// ✅ Marcar como dinámico si necesita datos frescos
export const dynamic = 'force-dynamic'

// ✅ Schema de validación para query params
const querySchema = z.object({
  tipo: z.enum(['Escolar', 'Remis', 'Demo']).default('Escolar'),
  buscar: z.string().optional(),
  pagina: z.coerce.number().min(1).default(1),
  limite: z.coerce.number().min(1).max(100).default(15),
})

/**
 * GET /api/habilitaciones
 * Obtiene lista de habilitaciones con filtros y paginación
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 1. ✅ Validar autenticación
    const session = await getSession()
    if (!session) {
      return ApiResponse.unauthorized()
    }

    // 2. ✅ Validar y parsear query params
    const searchParams = request.nextUrl.searchParams
    const queryResult = querySchema.safeParse({
      tipo: searchParams.get('tipo'),
      buscar: searchParams.get('buscar'),
      pagina: searchParams.get('pagina'),
      limite: searchParams.get('limite'),
    })

    if (!queryResult.success) {
      return ApiResponse.validationError(queryResult.error.errors)
    }

    const { tipo, buscar, pagina, limite } = queryResult.data

    // 3. ✅ Log de inicio (solo en development)
    logger.debug('Fetching habilitaciones', { tipo, buscar, pagina, limite })

    // 4. ✅ Construir where clause
    const where: any = {
      tipo_transporte: tipo,
      is_deleted: false,
    }

    if (buscar) {
      where.OR = [{ nro_licencia: { contains: buscar } }, { expte: { contains: buscar } }]
    }

    // 5. ✅ Query optimizado (solo campos necesarios para listado)
    const skip = (pagina - 1) * limite

    const [total, habilitaciones] = await Promise.all([
      prisma.habilitaciones_generales.count({ where }),
      prisma.habilitaciones_generales.findMany({
        where,
        skip,
        take: limite,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          nro_licencia: true,
          resolucion: true,
          estado: true,
          vigencia_inicio: true,
          vigencia_fin: true,
          tipo_transporte: true,
          expte: true,
          // Solo traer el titular para el listado
          habilitaciones_personas: {
            where: { rol: 'TITULAR' },
            take: 1,
            select: {
              persona: {
                select: {
                  nombre: true,
                  dni: true,
                },
              },
            },
          },
        },
      }),
    ])

    // 6. ✅ Formatear datos con type-safety
    const habilitacionesFormateadas: HabilitacionFormateada[] = habilitaciones.map(hab => ({
      id: hab.id,
      nro_licencia: hab.nro_licencia,
      resolucion: hab.resolucion,
      estado: hab.estado,
      vigencia_inicio: hab.vigencia_inicio,
      vigencia_fin: hab.vigencia_fin,
      tipo_transporte: hab.tipo_transporte,
      expte: hab.expte,
      observaciones: null, // No incluido en este query
      titular_principal: hab.habilitaciones_personas[0]?.persona?.nombre || null,
      personas: [], // No incluido en listado
      vehiculos: [], // No incluido en listado
      establecimientos: [], // No incluido en listado
      tiene_resolucion: false, // No incluido en este query
      resolucion_doc_id: null, // No incluido en este query
    }))

    // 7. ✅ Log de performance
    logger.perf('GET /api/habilitaciones', startTime)
    logger.info('Habilitaciones obtenidas', { count: habilitaciones.length, total })

    // 8. ✅ Respuesta consistente con paginación
    return ApiResponse.success({
      data: habilitacionesFormateadas,
      pagination: {
        pagina_actual: pagina,
        limite,
        total,
        total_paginas: Math.ceil(total / limite),
      },
    })
  } catch (error) {
    // ✅ Manejo de errores centralizado
    return ApiResponse.serverError('Error al obtener habilitaciones', error)
  }
}

/**
 * POST /api/habilitaciones
 * Crea una nueva habilitación
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 1. ✅ Autenticación
    const session = await getSession()
    if (!session) {
      return ApiResponse.unauthorized()
    }

    // 2. ✅ Autorización
    if (session.rol === 'lector') {
      return ApiResponse.forbidden('No tiene permisos para crear habilitaciones')
    }

    // 3. ✅ Validar datos de entrada
    const body = await request.json()

    // Aquí usarías tu schema de Zod
    // const result = habilitacionSchema.safeParse(body)
    // if (!result.success) {
    //   return ApiResponse.validationError(result.error.errors)
    // }

    // 4. ✅ Crear con transacción
    const nuevaHabilitacion = await prisma.$transaction(async tx => {
      const habilitacion = await tx.habilitaciones_generales.create({
        data: {
          tipo_transporte: body.tipo_transporte,
          estado: body.estado,
          nro_licencia: body.nro_licencia,
          // ... otros campos
        },
      })

      // Vincular relaciones
      if (body.personas?.length > 0) {
        await tx.habilitaciones_personas.createMany({
          data: body.personas.map((p: any) => ({
            habilitacion_id: habilitacion.id,
            persona_id: p.persona_id,
            rol: p.rol,
          })),
        })
      }

      return habilitacion
    })

    // 5. ✅ Log de éxito
    logger.success('Habilitación creada', {
      id: nuevaHabilitacion.id,
      nro_licencia: nuevaHabilitacion.nro_licencia,
    })
    logger.perf('POST /api/habilitaciones', startTime)

    // 6. ✅ Respuesta 201 Created
    return ApiResponse.created(nuevaHabilitacion, 'Habilitación creada exitosamente')
  } catch (error) {
    return ApiResponse.serverError('Error al crear habilitación', error)
  }
}
```

---

## BENEFICIOS DE LA MIGRACIÓN

### 🔒 Seguridad

- ✅ Validación de entrada con Zod
- ✅ Type-safety completo
- ✅ Autorización y autenticación clara

### ⚡ Performance

- ✅ Query optimizado (solo campos necesarios)
- ✅ Parallel queries (Promise.all)
- ✅ Paginación implementada

### 🐛 Debugging

- ✅ Logs estructurados (info, debug, error)
- ✅ Medición de performance
- ✅ Stack traces completos

### 📊 Mantenibilidad

- ✅ Código más legible
- ✅ Errores consistentes
- ✅ Fácil de testear
- ✅ Documentación inline

### 🎯 Developer Experience

- ✅ IntelliSense completo
- ✅ Errores en tiempo de desarrollo
- ✅ Refactoring seguro

---

## PASO A PASO PARA MIGRAR TUS APIs

### 1. Instalar y configurar nuevas utilidades

```bash
# Ya están creadas:
# - lib/logger.ts
# - lib/api-response.ts
# - lib/prisma-types.ts
```

### 2. Importar en tu API

```typescript
import { ApiResponse } from '@/lib/api-response'
import { logger } from '@/lib/logger'
import type { HabilitacionConRelaciones } from '@/lib/prisma-types'
```

### 3. Reemplazar console.log

```typescript
// Antes
console.log('Data:', data)

// Después
logger.info('Data cargada', { count: data.length })
```

### 4. Usar ApiResponse

```typescript
// Antes
return NextResponse.json({ success: true, data })

// Después
return ApiResponse.success(data, 'Operación exitosa')
```

### 5. Añadir validación

```typescript
const schema = z.object({
  // ... campos
})

const result = schema.safeParse(input)
if (!result.success) {
  return ApiResponse.validationError(result.error.errors)
}
```

### 6. Añadir tipos

```typescript
// Antes
const habilitaciones = await prisma.habilitaciones_generales.findMany()

// Después
const habilitaciones: HabilitacionConRelaciones[] = await prisma.habilitaciones_generales.findMany({
  include: {
    /* ... */
  },
})
```

---

## TESTING LA API MEJORADA

### Request de ejemplo

```bash
# GET con filtros
curl "http://localhost:3000/api/habilitaciones?tipo=Escolar&buscar=2024&pagina=1&limite=10"

# Response
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "pagina_actual": 1,
      "limite": 10,
      "total": 45,
      "total_paginas": 5
    }
  },
  "timestamp": "2025-01-17T10:30:00.000Z"
}
```

### Error handling

```bash
# Sin autenticación
curl "http://localhost:3000/api/habilitaciones"

# Response
{
  "success": false,
  "error": "No autenticado",
  "timestamp": "2025-01-17T10:30:00.000Z"
}
```

---

## PRÓXIMOS PASOS

1. ✅ Migrar API de habilitaciones (ejemplo arriba)
2. 🔄 Migrar API de personas
3. 🔄 Migrar API de vehículos
4. 🔄 Migrar API de inspecciones
5. 🔄 Migrar API de obleas

**Meta:** Tener todas las APIs usando las nuevas utilidades en 2 semanas.

---

**Documentación creada:** Enero 2025
