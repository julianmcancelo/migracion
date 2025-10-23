# 🔄 Sistema de Cambio de Material Rodante - Funcionamiento

## 📋 Descripción del Problema Resuelto

**Problema:** Después de cambiar el vehículo de una habilitación, el sistema seguía mostrando el vehículo viejo como activo.

**Solución:** Filtrar solo vehículos activos en todas las consultas de habilitaciones.

---

## ✅ Solución Implementada

### **1. Base de Datos - Control de Historial**

La tabla `habilitaciones_vehiculos` tiene campos para manejar el historial:

```sql
CREATE TABLE habilitaciones_vehiculos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  habilitacion_id INT,
  vehiculo_id INT,
  
  -- Control de historial
  fecha_alta DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_baja DATETIME NULL,
  activo BOOLEAN DEFAULT TRUE,
  observaciones_cambio TEXT,
  
  INDEX (activo)
);
```

### **2. Endpoint de Cambio de Vehículo**

**POST** `/api/habilitaciones/[id]/cambiar-vehiculo`

```typescript
// Proceso en transacción:
1. Marcar vehículo anterior como inactivo (activo = false, fecha_baja = NOW)
2. Crear nuevo vínculo como activo (activo = true, fecha_alta = NOW)
3. Guardar observaciones del cambio
```

**Flujo:**
```
Vehículo Anterior        Vehículo Nuevo
activo = true       →    activo = false
                         fecha_baja = NOW
                         
                         activo = true
                         fecha_alta = NOW
```

### **3. Filtrado en Consultas**

Todos los endpoints ahora filtran solo vehículos activos:

**GET `/api/habilitaciones`** (listado)
```typescript
habilitaciones_vehiculos: {
  where: {
    activo: true, // ✅ Solo vehículos activos
  },
  include: {
    vehiculo: true,
  },
}
```

**GET `/api/habilitaciones/[id]`** (detalle)
```typescript
habilitaciones_vehiculos: {
  where: {
    activo: true, // ✅ Solo vehículos activos
  },
  include: {
    vehiculo: true,
  },
}
```

### **4. Actualización del Frontend**

Después de un cambio exitoso, el frontend refresca los datos:

```typescript
onCambioExitoso={() => {
  setShowCambioVehiculoModal(false)
  router.refresh() // ✅ Refrescar datos sin reload completo
}}
```

---

## 🎯 Flujo Completo del Cambio

```
┌─────────────────────────────────────────┐
│ 1. Usuario abre modal "Cambio Material"│
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 2. Busca y selecciona nuevo vehículo   │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 3. Confirma cambio con observaciones    │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 4. Backend ejecuta en transacción:      │
│    a) Marca viejo como inactivo         │
│    b) Crea nuevo como activo            │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 5. Frontend refresca datos              │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ ✅ Usuario ve nuevo vehículo activo     │
└─────────────────────────────────────────┘
```

---

## 📊 Estado de Vehículos

### **Antes del Cambio:**

| ID | Habilitación | Vehículo | Activo | Fecha Alta | Fecha Baja |
|----|--------------|----------|--------|------------|------------|
| 1  | 100          | ABC123   | ✅ true | 2024-01-01 | null       |

### **Después del Cambio:**

| ID | Habilitación | Vehículo | Activo | Fecha Alta | Fecha Baja |
|----|--------------|----------|--------|------------|------------|
| 1  | 100          | ABC123   | ❌ false | 2024-01-01 | 2024-10-23 |
| 2  | 100          | XYZ789   | ✅ true | 2024-10-23 | null       |

---

## 🔍 Consulta del Historial

**GET** `/api/habilitaciones/[id]/cambiar-vehiculo`

```json
{
  "success": true,
  "data": {
    "vehiculo_actual": {
      "dominio": "XYZ789",
      "marca": "FORD",
      "modelo": "TRANSIT",
      "fecha_alta": "2024-10-23T10:00:00Z"
    },
    "historial": [
      {
        "dominio": "ABC123",
        "marca": "MERCEDES BENZ",
        "modelo": "SPRINTER",
        "fecha_alta": "2024-01-01T10:00:00Z",
        "fecha_baja": "2024-10-23T10:00:00Z",
        "observaciones": "Cambio de material rodante"
      }
    ],
    "total_cambios": 1
  }
}
```

---

## 🎨 Interfaz de Usuario

### **Modal de Cambio de Material**

```
┌────────────────────────────────────────┐
│ 🔄 Cambio de Material Rodante          │
├────────────────────────────────────────┤
│                                        │
│ Vehículo Actual:                       │
│ [ABC123] MERCEDES BENZ SPRINTER        │
│                                        │
│ Buscar Nuevo Vehículo:                 │
│ [____________] [🔍]                    │
│                                        │
│ Resultados:                            │
│ ┌────────────────────────────────────┐ │
│ │ XYZ789 │ FORD TRANSIT │ [Seleccionar] │
│ └────────────────────────────────────┘ │
│                                        │
│ Observaciones:                         │
│ [____________________________]         │
│                                        │
│ [Cancelar] [Confirmar Cambio]          │
└────────────────────────────────────────┘
```

---

## ⚙️ Configuración de Índices

Para optimizar las consultas, asegúrate de tener estos índices:

```sql
-- Índice en tabla habilitaciones_vehiculos
CREATE INDEX idx_activo ON habilitaciones_vehiculos(activo);
CREATE INDEX idx_habilitacion_activo ON habilitaciones_vehiculos(habilitacion_id, activo);
```

---

## 🐛 Troubleshooting

### **Problema: Sigue mostrando vehículo viejo**

**Causa:** Caché del navegador o filtro no aplicado

**Solución:**
1. Verificar que el filtro `activo: true` esté en todas las consultas
2. Hacer refresh con `Ctrl + F5` para limpiar caché
3. Verificar en la base de datos que `activo = 0` para el vehículo viejo

### **Problema: Error de TypeScript "activo does not exist"**

**Causa:** Prisma Client no regenerado localmente

**Solución:**
```bash
npx prisma generate
```

En Vercel se regenera automáticamente en cada deploy.

---

## 📝 Archivos Modificados

**Backend:**
- ✅ `app/api/habilitaciones/[id]/route.ts` - Filtro activo en GET individual
- ✅ `app/api/habilitaciones/route.ts` - Filtro activo en listado y POST
- ✅ `app/api/habilitaciones/[id]/cambiar-vehiculo/route.ts` - Ya implementado

**Frontend:**
- ✅ `app/(panel)/habilitaciones/_components/habilitaciones-table.tsx` - router.refresh()
- ✅ `components/habilitaciones/modal-cambio-vehiculo.tsx` - Callback onCambioExitoso

---

## ✅ Resultado Final

Después de implementar esta solución:

1. ✅ Al cambiar el vehículo, el vehículo viejo se marca como inactivo
2. ✅ El nuevo vehículo se marca como activo
3. ✅ Todas las consultas filtran solo vehículos activos
4. ✅ El historial completo se mantiene para auditoría
5. ✅ El frontend muestra automáticamente el nuevo vehículo

---

**Estado actual: FUNCIONANDO CORRECTAMENTE** ✅
