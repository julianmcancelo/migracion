# ✅ Mejoras en PDF de Obleas - Firmas y Evidencia Fotográfica

## 🎯 PROBLEMA RESUELTO

El PDF de obleas **no mostraba**:
- ❌ Firmas del inspector y receptor
- ❌ Foto de la oblea colocada (evidencia fotográfica)

**Causa raíz:** El código buscaba estos datos en la tabla `inspecciones` cuando deberían venir de la tabla `obleas`.

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. Corrección del Endpoint

**Archivo:** `app/api/obleas/[id]/pdf/route.ts`

#### Cambios Principales:

1. **✅ Lectura correcta desde tabla `obleas`**
```typescript
// ✅ AHORA: Lee desde tabla obleas
const oblea = await prisma.obleas.findUnique({
  where: { id: Number(id) },
})

// Campos disponibles:
// - oblea.path_foto             → Foto de la oblea colocada
// - oblea.path_firma_receptor   → Firma del contribuyente
// - oblea.path_firma_inspector  → Firma del inspector
```

2. **✅ Conversión automática a Base64**
```typescript
// Nueva función helper
async function convertirImagenABase64(path: string): Promise<string | null>
```

Soporta:
- ✅ URLs externas (`http://`, `https://`)
- ✅ Paths locales (`/uploads/`, `./public/`)
- ✅ Base64 directo (ya convertido)

3. **✅ Integración con el generador de PDF**
```typescript
const datosOblea = {
  // ... otros datos
  
  // ✅ Firmas desde tabla obleas
  inspector: {
    nombre: inspeccion?.nombre_inspector || 'Inspector Municipal',
    firma: firmaInspectorBase64 || undefined,  // ✅ Convertida a base64
  },
  contribuyente: {
    firma: firmaReceptorBase64 || undefined,   // ✅ Convertida a base64
  },
  
  // ✅ Foto de evidencia
  inspeccion: {
    fecha: oblea.fecha_colocacion,
    resultado: 'OBLEA COLOCADA',
    fotos: fotoObleaBase64
      ? [{
          tipo: 'Oblea Colocada',
          path: fotoObleaBase64,  // ✅ Convertida a base64
        }]
      : [],
  },
}
```

---

## 📋 ESTRUCTURA DEL PDF GENERADO

### Página 1: Certificado Principal

```
┌───────────────────────────────────────────────┐
│  MUNICIPALIDAD DE LANÚS                       │
│  Subsecretaría de Ordenamiento Urbano         │
│  Dirección General de Movilidad y Transporte  │
└───────────────────────────────────────────────┘

        CERTIFICADO DE ENTREGA DE OBLEA
               Transporte Escolar/Remis

┌─────────────────────────────────────────────┐
│ DATOS DEL TITULAR:                          │
│ Nombre: Juan Pérez                          │
│ DNI: 12345678                               │
│ Domicilio: Av. Hipólito Yrigoyen 123       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ DATOS DEL VEHÍCULO:                         │
│ Dominio: ABC123                             │
│ Marca/Modelo: Ford Transit 2020             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│   LICENCIA DE HABILITACIÓN N°               │
│              2024-ESC-001                    │
│    Vigencia hasta 31/12/2025                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│      FIRMAS Y CONFORMIDAD                   │
├──────────────────┬──────────────────────────┤
│  INSPECTOR       │     CONTRIBUYENTE        │
│  MUNICIPAL       │                          │
│                  │                          │
│  [FIRMA IMAGE]   │     [FIRMA IMAGE]        │
│  ____________    │     ____________         │
│  Inspector Mpal  │     Juan Pérez           │
└──────────────────┴──────────────────────────┘
```

### Página 2: Evidencia Fotográfica

```
┌───────────────────────────────────────────────┐
│          EVIDENCIA FOTOGRÁFICA                │
└───────────────────────────────────────────────┘

┌─────────────────────┬─────────────────────┐
│                     │                     │
│   [FOTO OBLEA]      │                     │
│   Oblea Colocada    │   (Espacio para     │
│                     │    más fotos)       │
│                     │                     │
└─────────────────────┴─────────────────────┘
```

---

## 🧪 CÓMO PROBAR

### Opción 1: Desde la App (Recomendado)

1. Ir a la página de obleas:
```
http://localhost:3000/obleas
```

2. Click en el botón **"Ver PDF"** de cualquier oblea colocada

3. Se abrirá el PDF con:
   - ✅ Firmas visibles (si existen en la BD)
   - ✅ Foto de la oblea (si existe en la BD)

### Opción 2: Endpoint Directo

```bash
# Reemplazar {id} por un ID real de la tabla obleas
curl http://localhost:3000/api/obleas/1/pdf --output oblea.pdf

# Ver el PDF generado
start oblea.pdf  # Windows
open oblea.pdf   # Mac
xdg-open oblea.pdf  # Linux
```

### Opción 3: Postman / Insomnia

```http
GET http://localhost:3000/api/obleas/1/pdf
```

**Headers automáticos:**
```
Content-Type: application/pdf
Content-Disposition: inline; filename="Certificado-Oblea-2024-ESC-001.pdf"
```

---

## 📊 DATOS NECESARIOS EN LA BASE DE DATOS

Para que el PDF muestre todo correctamente, la tabla `obleas` debe tener:

```sql
SELECT 
  id,
  habilitacion_id,
  nro_licencia,
  titular,
  fecha_colocacion,
  path_foto,                 -- ✅ IMPORTANTE: Foto de la oblea
  path_firma_receptor,       -- ✅ IMPORTANTE: Firma del contribuyente
  path_firma_inspector       -- ✅ IMPORTANTE: Firma del inspector
FROM obleas
WHERE id = 1;
```

### Formatos Soportados para Paths:

1. **Base64 directo** (mejor opción):
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

2. **URL externa**:
```
https://ejemplo.com/uploads/firma-123.png
https://storage.googleapis.com/bucket/firma.jpg
```

3. **Path local del servidor**:
```
/uploads/firmas/firma-123.png
./public/obleas/foto-456.jpg
```

---

## 🔧 FORMATO DE IMÁGENES

### Firmas
- **Formato recomendado:** PNG con fondo transparente
- **Tamaño óptimo:** 500x150 px
- **Peso máximo:** 200 KB

### Fotos
- **Formato recomendado:** JPEG
- **Tamaño óptimo:** 1024x768 px
- **Peso máximo:** 500 KB

---

## 🐛 TROUBLESHOOTING

### Problema 1: "Firma no disponible"

**Causa:** El campo `path_firma_*` está vacío o el path es inválido

**Solución:**
```sql
-- Verificar que existen los paths
SELECT path_firma_receptor, path_firma_inspector
FROM obleas
WHERE id = 1;

-- Si están vacíos, actualizar:
UPDATE obleas
SET 
  path_firma_receptor = 'data:image/png;base64,...',
  path_firma_inspector = 'data:image/png;base64,...'
WHERE id = 1;
```

### Problema 2: "Foto no disponible"

**Causa:** El campo `path_foto` está vacío o el archivo no existe

**Solución:**
```sql
-- Verificar path
SELECT path_foto FROM obleas WHERE id = 1;

-- Actualizar con imagen válida:
UPDATE obleas
SET path_foto = 'https://ejemplo.com/foto-oblea.jpg'
WHERE id = 1;
```

### Problema 3: Error "Failed to load image"

**Causa:** La imagen no se puede convertir a base64

**Soluciones:**
1. Verificar que la URL sea accesible públicamente
2. Verificar que el formato sea PNG o JPEG
3. Verificar permisos del archivo en el servidor
4. Ver logs de consola para detalles del error

---

## 📈 LOGS DE DEBUG

El endpoint genera logs detallados:

```bash
🔍 Buscando oblea con ID: 1
✅ Oblea encontrada: {
  id: 1,
  tiene_foto: true,
  tiene_firma_receptor: true,
  tiene_firma_inspector: true
}
📸 Convirtiendo imágenes a base64...
✍️ Firma receptor: Convertida
✍️ Firma inspector: Convertida
📷 Foto oblea: Convertida
📄 Datos preparados para PDF: {
  tiene_firmas: true,
  tiene_fotos: true
}
📝 Generando PDF de oblea con evidencia completa...
✅ PDF generado exitosamente
```

---

## 🎨 PERSONALIZACIÓN

### Cambiar estilo de firmas

Editar `lib/oblea-pdf-generator.ts` líneas 222-286:

```typescript
// Tamaño de las cajas de firma
const firmaHeight = 35  // Cambiar altura

// Posición X de las firmas
const firmaInspectorX = 50      // Firma izquierda
const firmaContribuyenteX = 155  // Firma derecha
```

### Cambiar tamaño de fotos

Editar `lib/oblea-pdf-generator.ts` líneas 305-306:

```typescript
const imgWidth = 85   // Ancho en mm
const imgHeight = 64  // Alto en mm
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de usar en producción:

- [ ] Verificar que todas las obleas tienen `path_firma_receptor`
- [ ] Verificar que todas las obleas tienen `path_firma_inspector`
- [ ] Verificar que todas las obleas tienen `path_foto`
- [ ] Probar con diferentes formatos de imagen (PNG, JPEG)
- [ ] Probar con URLs externas
- [ ] Probar con base64 directo
- [ ] Verificar que el PDF se genera en <2 segundos
- [ ] Verificar que las imágenes se ven claras en el PDF
- [ ] Probar descarga desde el panel de obleas

---

## 📚 ARCHIVOS RELACIONADOS

- `app/api/obleas/[id]/pdf/route.ts` - Endpoint mejorado ✅
- `lib/oblea-pdf-generator.ts` - Generador de PDF (sin cambios)
- `app/(panel)/obleas/page.tsx` - Panel de obleas
- `prisma/schema.prisma` - Esquema de la tabla obleas

---

## 🚀 PRÓXIMAS MEJORAS (Opcional)

1. **Comprimir imágenes automáticamente** (reducir tamaño del PDF)
2. **Agregar QR con link de verificación** en el PDF
3. **Marca de agua** con número de oblea
4. **Múltiples fotos** (frente, lateral, interior)
5. **Exportar a otros formatos** (Word, Excel)

---

**Fecha de implementación:** Enero 2025  
**Versión:** 2.0.0  
**Estado:** ✅ Implementado y funcional
