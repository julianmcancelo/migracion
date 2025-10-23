# 📋 Sistema de Novedades/Auditoría para Habilitaciones

## 🎯 Descripción

Sistema completo de auditoría que registra TODAS las novedades/cambios en las habilitaciones:
- ✅ Cambios en la habilitación general
- ✅ Altas y bajas de personas (titular, conductores, celadores)
- ✅ Cambios de vehículos (material rodante)
- ✅ Modificaciones de establecimientos
- ✅ Cualquier otro cambio relevante

---

## 📊 Estructura de la Tabla `habilitaciones_novedades`

```sql
CREATE TABLE habilitaciones_novedades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  habilitacion_id INT NOT NULL,              -- Habilitación afectada
  tipo_novedad VARCHAR(50) NOT NULL,         -- Tipo de cambio
  entidad_afectada VARCHAR(50) NOT NULL,     -- Qué se modificó
  entidad_id INT NULL,                       -- ID de la entidad
  descripcion TEXT NOT NULL,                 -- Descripción legible
  datos_anteriores JSON NULL,                -- Estado anterior
  datos_nuevos JSON NULL,                    -- Estado nuevo
  usuario_id INT NULL,                       -- Quién hizo el cambio
  usuario_nombre VARCHAR(100) NULL,          -- Nombre del usuario
  fecha_novedad DATETIME DEFAULT NOW(),      -- Cuándo se hizo
  observaciones TEXT NULL                    -- Notas adicionales
);
```

---

## 🏷️ Tipos de Novedades

| Tipo | Descripción | Entidad Afectada |
|------|-------------|------------------|
| **ALTA** | Alta de nueva entidad | PERSONA, VEHICULO, ESTABLECIMIENTO |
| **BAJA** | Baja de entidad | PERSONA, VEHICULO, ESTABLECIMIENTO |
| **MODIFICACION** | Cambio de datos | HABILITACION, PERSONA, VEHICULO |
| **CAMBIO_VEHICULO** | Cambio de material rodante | VEHICULO |
| **CAMBIO_ESTADO** | Cambio de estado de habilitación | HABILITACION |
| **RENOVACION** | Renovación de vigencia | HABILITACION |
| **SUSPENSION** | Suspensión temporal | HABILITACION |
| **REVOCACION** | Revocación definitiva | HABILITACION |

---

## 📝 Ejemplos de Registro

### **1. Cambio de Vehículo (Automático)**

```json
{
  "habilitacion_id": 100,
  "tipo_novedad": "CAMBIO_VEHICULO",
  "entidad_afectada": "VEHICULO",
  "entidad_id": 456,
  "descripcion": "Cambio de material rodante: ABC123 → XYZ789",
  "datos_anteriores": {
    "vehiculo_id": 123,
    "dominio": "ABC123",
    "marca": "MERCEDES BENZ",
    "modelo": "SPRINTER"
  },
  "datos_nuevos": {
    "vehiculo_id": 456,
    "dominio": "XYZ789",
    "marca": "FORD",
    "modelo": "TRANSIT"
  },
  "usuario_nombre": "Juan Pérez",
  "fecha_novedad": "2024-10-23T10:30:00Z",
  "observaciones": "Cambio solicitado por el titular"
}
```

### **2. Alta de Conductor**

```json
{
  "habilitacion_id": 100,
  "tipo_novedad": "ALTA",
  "entidad_afectada": "PERSONA",
  "entidad_id": 789,
  "descripcion": "Alta de conductor: Carlos Gómez (DNI 12345678)",
  "datos_nuevos": {
    "persona_id": 789,
    "nombre": "Carlos Gómez",
    "dni": "12345678",
    "rol": "CONDUCTOR"
  },
  "usuario_nombre": "María López",
  "fecha_novedad": "2024-10-23T11:00:00Z"
}
```

### **3. Cambio de Estado**

```json
{
  "habilitacion_id": 100,
  "tipo_novedad": "CAMBIO_ESTADO",
  "entidad_afectada": "HABILITACION",
  "descripcion": "Cambio de estado: EN_TRAMITE → HABILITADO",
  "datos_anteriores": {
    "estado": "EN_TRAMITE"
  },
  "datos_nuevos": {
    "estado": "HABILITADO",
    "resolucion": "RES-2024-100"
  },
  "usuario_nombre": "Admin Sistema",
  "fecha_novedad": "2024-10-23T12:00:00Z"
}
```

---

## 🔌 API Endpoints

### **GET /api/habilitaciones/[id]/novedades**

Obtiene todas las novedades de una habilitación.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "novedades": [
      {
        "id": 1,
        "habilitacion_id": 100,
        "tipo_novedad": "CAMBIO_VEHICULO",
        "entidad_afectada": "VEHICULO",
        "descripcion": "Cambio de material rodante...",
        "fecha_novedad": "2024-10-23T10:30:00Z"
      }
    ],
    "total": 1
  }
}
```

### **POST /api/habilitaciones/[id]/novedades**

Registra una novedad manualmente.

**Body:**
```json
{
  "tipo_novedad": "MODIFICACION",
  "entidad_afectada": "HABILITACION",
  "descripcion": "Actualización de observaciones",
  "datos_anteriores": {...},
  "datos_nuevos": {...},
  "observaciones": "Notas adicionales"
}
```

---

## ⚙️ Registro Automático de Novedades

El sistema registra automáticamente en estos casos:

### **1. Cambio de Vehículo** ✅ IMPLEMENTADO
```typescript
// Al cambiar vehículo, se registra automáticamente
await prisma.habilitaciones_novedades.create({
  data: {
    habilitacion_id,
    tipo_novedad: 'CAMBIO_VEHICULO',
    entidad_afectada: 'VEHICULO',
    entidad_id: nuevo_vehiculo_id,
    descripcion: `Cambio: ${viejo} → ${nuevo}`,
    datos_anteriores: JSON.stringify(vehiculoAnterior),
    datos_nuevos: JSON.stringify(vehiculoNuevo),
  },
})
```

### **2. Alta/Baja de Personas** 🔜 POR IMPLEMENTAR
```typescript
// Al agregar/quitar persona
await registrarNovedad({
  tipo_novedad: 'ALTA', // o 'BAJA'
  entidad_afectada: 'PERSONA',
  entidad_id: persona_id,
  descripcion: `Alta de ${rol}: ${nombre}`,
  datos_nuevos: datosPersona,
})
```

### **3. Cambio de Estado** 🔜 POR IMPLEMENTAR
```typescript
// Al cambiar estado de habilitación
await registrarNovedad({
  tipo_novedad: 'CAMBIO_ESTADO',
  entidad_afectada: 'HABILITACION',
  descripcion: `Estado: ${anterior} → ${nuevo}`,
  datos_anteriores: { estado: anterior },
  datos_nuevos: { estado: nuevo },
})
```

---

## 🎨 Componente de UI (Futuro)

```tsx
<NovedadesTimeline habilitacionId={100} />
```

**Mostrará:**
```
┌─────────────────────────────────────────┐
│ 📋 NOVEDADES DE LA HABILITACIÓN         │
├─────────────────────────────────────────┤
│                                         │
│ 🔄 23/10/2024 10:30                     │
│    Cambio de vehículo                   │
│    ABC123 → XYZ789                      │
│    Por: Juan Pérez                      │
│                                         │
│ ✅ 22/10/2024 15:00                     │
│    Alta de conductor                    │
│    Carlos Gómez (DNI 12345678)          │
│    Por: María López                     │
│                                         │
│ 📝 20/10/2024 09:00                     │
│    Cambio de estado                     │
│    EN_TRAMITE → HABILITADO              │
│    Por: Admin Sistema                   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 💡 Casos de Uso

### **1. Auditoría Completa**
```sql
-- Ver todo el historial de una habilitación
SELECT * FROM habilitaciones_novedades 
WHERE habilitacion_id = 100 
ORDER BY fecha_novedad DESC;
```

### **2. Buscar Cambios de Vehículos**
```sql
-- Ver todos los cambios de vehículo
SELECT * FROM habilitaciones_novedades 
WHERE tipo_novedad = 'CAMBIO_VEHICULO'
AND habilitacion_id = 100;
```

### **3. Actividad por Usuario**
```sql
-- Ver qué hizo un usuario
SELECT * FROM habilitaciones_novedades 
WHERE usuario_nombre = 'Juan Pérez'
ORDER BY fecha_novedad DESC;
```

### **4. Cambios Recientes**
```sql
-- Ver cambios de la última semana
SELECT * FROM habilitaciones_novedades 
WHERE fecha_novedad >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY fecha_novedad DESC;
```

---

## 🔧 Implementación Pendiente

### **Alta/Baja de Personas**
- [ ] Registrar cuando se agrega titular
- [ ] Registrar cuando se agrega conductor
- [ ] Registrar cuando se agrega celador
- [ ] Registrar cuando se da de baja cualquier persona

### **Cambios en Habilitación**
- [ ] Cambio de estado
- [ ] Renovación de vigencia
- [ ] Cambio de tipo
- [ ] Modificación de observaciones

### **Establecimientos**
- [ ] Alta de establecimiento
- [ ] Baja de establecimiento
- [ ] Modificación de establecimiento

### **Obleas**
- [ ] Emisión de oblea
- [ ] Colocación de oblea
- [ ] Reemplazo de oblea

### **Inspecciones**
- [ ] Inspección realizada
- [ ] Resultado de inspección
- [ ] Aprobación/Rechazo

---

## 📊 Dashboard de Novedades (Futuro)

```typescript
// Obtener estadísticas
const stats = await prisma.habilitaciones_novedades.groupBy({
  by: ['tipo_novedad'],
  _count: true,
  where: {
    fecha_novedad: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Último mes
    },
  },
})
```

**Resultado:**
```
Cambios Vehiculares: 15
Altas de Personas: 8
Bajas de Personas: 3
Cambios de Estado: 12
```

---

## ✅ Estado Actual

- ✅ **Tabla creada** - `habilitaciones_novedades`
- ✅ **Schema actualizado** - Prisma schema con modelo completo
- ✅ **API creada** - Endpoints GET y POST
- ✅ **Registro automático** - Cambios de vehículo
- ⏳ **Pendiente** - Registro de otros tipos de cambios
- ⏳ **Pendiente** - Componente UI para ver novedades

---

## 🚀 Próximos Pasos

1. **Ejecutar SQL:** Crear tabla en base de datos
2. **Regenerar Prisma:** `npx prisma generate`
3. **Deploy:** Subir cambios a Vercel
4. **Implementar registros:** Agregar en otros endpoints
5. **Crear UI:** Componente timeline de novedades

---

**Sistema de Auditoría Completo** ✅
