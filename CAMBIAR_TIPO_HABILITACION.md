# 📋 Cambiar Tipo de Habilitación

## 🎯 Descripción

Sistema para visualizar y modificar el **Tipo de Habilitación** con registro automático en el historial de novedades.

---

## 🎨 Tipos de Habilitación Disponibles

| Tipo | Descripción | Cuándo Usarlo |
|------|-------------|---------------|
| **Alta** | Primera vez | Habilitación nueva sin antecedentes |
| **Renovación** | Renovación periódica | Vencimiento y renovación normal |
| **Cambio de Material** | Cambio de vehículo | Cuando se cambia el material rodante |
| **Cambio de Titularidad** | Cambio de titular | Transferencia a nuevo responsable |
| **Ampliación** | Ampliación de servicios | Agregar unidades o rutas |
| **Modificación** | Cambio de datos | Actualización de información |
| **Baja** | Cese de actividad | Finalización de la habilitación |

---

## 📍 Ubicación

### **En el Modal de Detalle de Habilitación:**

```
┌────────────────────────────────────────┐
│ Habilitación #100                      │
├────────────────────────────────────────┤
│ Datos de la Habilitación              │
│                                        │
│ Estado: HABILITADO                     │
│ Tipo Transporte: Escolar               │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ Tipo de Habilitación [Cambiar]   │  │
│ │ Renovación               ← AQUÍ   │  │
│ └──────────────────────────────────┘  │
│                                        │
│ Vigencia Inicio: 01/01/2024           │
│ Vigencia Fin: 31/12/2024              │
└────────────────────────────────────────┘
```

---

## 🔄 Cómo Cambiar el Tipo

### **Paso 1: Abrir Modal de Detalle**
```
Habilitaciones → Click en habilitación
```

### **Paso 2: Click en "Cambiar"**
```
En la sección "Tipo de Habilitación"
```

### **Paso 3: Seleccionar Nuevo Tipo**
```
┌────────────────────────────────────────┐
│ 📋 Cambiar Tipo de Habilitación       │
├────────────────────────────────────────┤
│ Tipo Actual: Renovación                │
│                                        │
│ Nuevo Tipo: [Cambio de Material ▼]    │
│                                        │
│ Observaciones (opcional):              │
│ ┌────────────────────────────────────┐ │
│ │ Cambio solicitado por titular...   │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ℹ️ Se registrará en el historial      │
│                                        │
│ [Cancelar] [Cambiar Tipo]             │
└────────────────────────────────────────┘
```

### **Paso 4: Confirmar**
```
Se actualiza el tipo
Se registra en historial de novedades
```

---

## 📊 Registro en Novedades

Cada cambio de tipo se registra automáticamente:

```
┌────────────────────────────────────────┐
│ 📋 HISTORIAL DE NOVEDADES              │
├────────────────────────────────────────┤
│ 📋 ─┐                                  │
│     │  CAMBIO_TIPO                     │
│     │  Cambio de tipo:                 │
│     │  Renovación → Cambio de Material │
│     │  📝 Cambio solicitado por...     │
│     │  📅 23/10/24 14:30 👤 Admin      │
└────────────────────────────────────────┘
```

---

## 🎨 Visualización Destacada

El tipo se muestra en una **caja destacada azul** con botón de edición:

```
┌────────────────────────────────────────┐
│ Tipo de Habilitación      [✏️ Cambiar] │
│ ═══════════════════════════════        │
│ Cambio de Material                     │
└────────────────────────────────────────┘
```

---

## 💻 Implementación Técnica

### **Endpoint API:**

```typescript
POST /api/habilitaciones/{id}/cambiar-tipo

Body:
{
  "tipo_nuevo": "Cambio de Material",
  "observaciones": "Cambio solicitado por el titular..."
}

Response:
{
  "success": true,
  "message": "Tipo de habilitación actualizado exitosamente",
  "data": {
    "tipo_anterior": "Renovación",
    "tipo_nuevo": "Cambio de Material"
  }
}
```

### **Componentes:**

**Modal de Cambio:**
```tsx
// app/(panel)/habilitaciones/_components/modal-cambiar-tipo.tsx
<ModalCambiarTipo
  open={modalOpen}
  onOpenChange={setModalOpen}
  habilitacion={habilitacion}
  onCambioExitoso={() => recargar()}
/>
```

**En Modal de Detalle:**
```tsx
// Sección destacada con botón
<div className="border-2 border-blue-200 bg-blue-50 p-4">
  <Button onClick={() => setModalOpen(true)}>
    Cambiar
  </Button>
  <p>{habilitacion.tipo || 'Sin especificar'}</p>
</div>
```

---

## 🔐 Permisos

- ✅ **Admin** - Puede cambiar tipo
- ✅ **Inspector** - Puede cambiar tipo
- ❌ **Demo** - No puede cambiar tipo
- ❌ **Lector** - No puede cambiar tipo

---

## 📝 Novedades Registradas

Cada cambio genera una novedad con:

- **Tipo:** `CAMBIO_TIPO`
- **Entidad:** `HABILITACION`
- **Descripción:** "Cambio de tipo: X → Y"
- **Datos anteriores:** `{ tipo: "X" }`
- **Datos nuevos:** `{ tipo: "Y" }`
- **Usuario:** Nombre del usuario que hizo el cambio
- **Observaciones:** Notas opcionales

---

## 🎯 Casos de Uso Reales

### **1. Cambio de Material Rodante**
```
Alta → Cambio de Material
"El titular cambió su vehículo anterior por uno nuevo"
```

### **2. Renovación Anual**
```
Alta → Renovación
"Primera renovación anual de la habilitación"
```

### **3. Cambio de Titularidad**
```
Renovación → Cambio de Titularidad
"El vehículo fue vendido a un nuevo propietario"
```

### **4. Ampliación de Flota**
```
Alta → Ampliación
"Se agregó una nueva unidad a la flota existente"
```

---

## ✅ Beneficios

- 📋 **Claridad** - Se sabe exactamente qué tipo de trámite es
- 🔍 **Auditoría** - Cada cambio queda registrado
- 📊 **Estadísticas** - Permite analizar tipos de trámites
- 🎯 **Organización** - Facilita la gestión administrativa
- 📝 **Trazabilidad** - Historial completo de cambios

---

## 🚀 Próximas Mejoras

- [ ] Reglas automáticas (ej: si cambia vehículo → tipo "Cambio de Material")
- [ ] Alertas para tipos específicos
- [ ] Reportes por tipo de trámite
- [ ] Validaciones según el tipo
- [ ] Workflows específicos por tipo

---

**Sistema de Cambio de Tipo: FUNCIONANDO** ✅
