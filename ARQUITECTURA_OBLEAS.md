# Arquitectura del Sistema de Obleas

## 📊 Estructura de Tablas

### 1. `obleas` - Tabla Principal (Obleas Colocadas)

**Propósito:** Registro definitivo de obleas físicamente colocadas en vehículos

**Campos:**

- `id` - ID único de la oblea
- `habilitacion_id` - FK a la habilitación
- `nro_licencia` - Número de licencia
- `titular` - Nombre del titular
- `fecha_colocacion` - Fecha y hora de colocación
- `path_foto` - Foto de la oblea colocada
- `path_firma_receptor` - Firma digital del receptor/contribuyente
- `path_firma_inspector` - Firma digital del inspector

**Uso:**

- Datos históricos (ya cargados)
- Nuevas obleas con evidencia completa
- Fuente para generar certificados PDF oficiales

### 2. `oblea_historial` - Tabla de Tracking (Historial de Solicitudes)

**Propósito:** Registro cronológico de solicitudes y cambios de estado

**Campos:**

- `id` - ID único de la solicitud
- `habilitacion_id` - FK a la habilitación
- `fecha_solicitud` - Fecha de la solicitud
- `hora_solicitud` - Hora de la solicitud
- `creado_en` - Timestamp de creación
- `notificado` - Estado de notificación (si/no)

**Uso:**

- Tracking de flujo de trabajo
- Control de solicitudes pendientes
- Auditoría de cambios de estado

## 🔄 Flujo de Trabajo

### Escenario 1: Consulta de Obleas Colocadas (Históricas)

```
Usuario → /obleas → API lee tabla `obleas` → Muestra listado completo
                                           → Botón PDF genera certificado con evidencia
```

### Escenario 2: Nueva Oblea con Evidencia Completa

```
1. Inspector genera solicitud → Se registra en `oblea_historial` (notificado='no')
2. Inspector realiza inspección → Captura firmas + fotos
3. Inspector coloca oblea → Se registra en `obleas` con toda la evidencia
4. Sistema actualiza → `oblea_historial` (notificado='si')
5. PDF generado → Incluye firmas + fotos + datos completos
```

### Escenario 3: Generar PDF de Oblea Existente

```
Usuario click "PDF" → API busca en `obleas` por ID
                   → Obtiene firmas (path_firma_*)
                   → Obtiene fotos (path_foto)
                   → Busca inspección relacionada (si existe)
                   → Genera PDF completo con toda evidencia
```

## 📄 Generación de PDFs

### PDF de Oblea Histórica (tabla `obleas`)

**Contenido:**

- ✅ Datos del titular y vehículo
- ✅ Número de licencia y vigencia
- ✅ Firma del inspector (si existe `path_firma_inspector`)
- ✅ Firma del contribuyente (si existe `path_firma_receptor`)
- ✅ Foto de la oblea colocada (si existe `path_foto`)
- ⚠️ Nota: "Oblea histórica - Datos del sistema anterior"

### PDF de Oblea Nueva (con inspección completa)

**Contenido:**

- ✅ Todos los datos anteriores +
- ✅ Resultado de inspección detallado
- ✅ Items inspeccionados (estado: Bien/Regular/Mal)
- ✅ Fotos completas del vehículo (frente, atrás, laterales, interior)
- ✅ Firmas digitales capturadas en tiempo real
- ✅ GPS y timestamp de inspección

## 🔗 Vinculación Entre Tablas

**Propuesta de vinculación:**

- Agregar campo `oblea_id` en tabla `oblea_historial` (opcional)
- Permite vincular solicitud → oblea colocada
- Mantiene trazabilidad completa del proceso

**Ventajas:**

1. ✅ Preserva datos históricos
2. ✅ Permite nuevas obleas con evidencia completa
3. ✅ Trazabilidad end-to-end
4. ✅ Auditoría completa
5. ✅ PDFs con evidencia según disponibilidad

## 🎯 Rutas API

### GET `/api/obleas`

- Lee tabla `obleas` (obleas colocadas)
- Retorna listado completo con datos
- Soporta filtros y búsqueda

### GET `/api/obleas/:id/pdf`

- Genera PDF con evidencia disponible
- Busca firmas y fotos en tabla `obleas`
- Busca inspección relacionada (si existe)
- Incluye todo lo disponible

### GET `/api/obleas/historial`

- Lee tabla `oblea_historial` (solicitudes)
- Retorna tracking de solicitudes
- Estado de notificación

### POST `/api/obleas`

- Crea nueva oblea en tabla `obleas`
- Guarda firmas y fotos
- Actualiza `oblea_historial` si existe solicitud previa

## 💾 Almacenamiento de Evidencia

**Firmas digitales:**

- Base64 en campos `path_firma_*` (sistema actual)
- Opción: Migrar a archivos físicos en `/public/firmas/`

**Fotos:**

- Base64 en campo `path_foto` (sistema actual)
- Opción: Migrar a archivos físicos en `/public/fotos/`

**Recomendación:** Mantener base64 para compatibilidad con datos históricos, usar archivos para nuevas obleas.

## 🔐 Seguridad y Validación

1. ✅ Toda oblea debe tener `habilitacion_id` válida
2. ✅ Firmas obligatorias para nuevas obleas
3. ✅ Al menos 1 foto para nuevas obleas
4. ✅ Timestamp inmutable en `fecha_colocacion`
5. ✅ Log de auditoría en `oblea_historial`

## 📊 Dashboard y Reportes

**Métricas clave:**

- Total obleas colocadas (tabla `obleas`)
- Solicitudes pendientes (tabla `oblea_historial` WHERE notificado='no')
- Obleas del mes
- Obleas por tipo de transporte
- Habilitaciones sin oblea

**Estadísticas mixtas:**

- Combinar datos de ambas tablas
- `obleas` para totales definitivos
- `oblea_historial` para flujo de trabajo
