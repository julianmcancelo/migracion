# 🔄 Actualización Renovación Completa

## ✅ Cambios Implementados

### **1. Menú con "Cambio de Titular"**

Agregado al submenú "Gestión":

```
🔄 Gestión  ►
  ├─ 🔁 Renovar Habilitación
  ├─ 👤 Cambio de Titular      ← NUEVO (próximamente)
  ├─ 🚗 Cambio de Material
  ├─ 🛡️  Gestionar Obleas
  └─ 📅 Asignar Turno
```

**Modal "Próximamente":**
- Mensaje claro: "🚧 Próximamente"
- Explica que la funcionalidad estará disponible pronto
- Sugiere alternativas (editar o renovar)
- Botón "Entendido" para cerrar

---

### **2. Renovación con Titular, Chofer y Celador**

El modal de renovación ahora permite gestionar **todas las personas**:

```
┌──────────────────────────────────────┐
│ 🔄 Renovar Habilitación 2025        │
├──────────────────────────────────────┤
│ Nuevo Expediente *                   │
│ [EXP-2025-0123_______________]       │
│                                      │
│ ☑️ Mantener mismas personas         │
│    (titular, chofer, celador)        │
│                                      │
│ ☑️ Mantener mismo vehículo          │
│                                      │
└──────────────────────────────────────┘
```

**Al desmarcar "Mantener personas":**

```
☐ Mantener mismas personas

┌──────────────────────────────────────┐
│ 👤 Titular *                         │
│ ┌────────────────────────────────┐   │
│ │ [🔍 Buscar] [➕ Crear Nuevo]   │   │
│ └────────────────────────────────┘   │
│                                      │
│ 🚗 Chofer (opcional)                │
│ ┌────────────────────────────────┐   │
│ │ [🔍 Buscar] [➕ Crear Nuevo]   │   │
│ └────────────────────────────────┘   │
│                                      │
│ 👨‍✈️ Celador/a (opcional)            │
│ ┌────────────────────────────────┐   │
│ │ [🔍 Buscar] [➕ Crear Nuevo]   │   │
│ └────────────────────────────────┘   │
└──────────────────────────────────────┘
```

---

## 🎯 Casos de Uso

### **Caso 1: Renovación Simple** (más común)
- Marca todo ✅
- Solo escribe expediente
- Click "Renovar"
→ Copia titular, chofer, celador y vehículo

### **Caso 2: Cambiar Solo Chofer**
- Desmarca "personas"
- Selecciona titular existente (o crea nuevo)
- **Busca chofer diferente** o crea uno nuevo
- No agrega celador (opcional)
- Marca "vehículo" para copiarlo
→ Nueva habilitación con nuevo chofer

### **Caso 3: Todo Nuevo**
- Desmarca todo
- Busca o crea titular
- Busca o crea chofer
- Busca o crea celador (si tiene)
- Busca o crea vehículo
→ Habilitación completamente nueva

---

## 📋 API Actualizada

**POST** `/api/habilitaciones/[id]/renovar`

### Body con Personas:
```json
{
  "nuevoExpediente": "EXP-2025-0123",
  "copiarPersonas": false,
  "personas": [
    {
      "id": 1,              // Si existe
      "nombre": "Juan",
      "apellido": "García",
      "dni": "12345678",
      "rol": "TITULAR"
    },
    {
      // Si no tiene ID, se crea nuevo
      "nombre": "María",
      "apellido": "López",
      "dni": "87654321",
      "rol": "CHOFER"
    },
    {
      "id": 3,
      "nombre": "Pedro",
      "apellido": "Martínez",
      "dni": "11223344",
      "rol": "CELADOR"
    }
  ],
  "copiarVehiculo": true
}
```

---

## 🔧 Lógica del Backend (Pendiente Actualizar)

La API debe:

1. **Si `copiarPersonas = true`**: Copiar todas las relaciones de `habilitaciones_personas`
2. **Si `copiarPersonas = false`**: 
   - Recibir array `personas` con roles
   - Para cada persona:
     - **Si tiene `id`** → Asociar persona existente
     - **Si NO tiene `id`** → Crear nueva persona y asociar
   - Crear relaciones en `habilitaciones_personas` con rol correcto

### Ejemplo Backend:
```typescript
if (!copiarPersonas && body.personas) {
  for (const personaData of body.personas) {
    let personaId = personaData.id
    
    // Crear nueva si no existe
    if (!personaId) {
      const nuevaPersona = await prisma.personas.create({
        data: {
          nombre: personaData.nombre,
          apellido: personaData.apellido,
          dni: personaData.dni,
          // ... más campos
        }
      })
      personaId = nuevaPersona.id
    }
    
    // Asociar a habilitación con rol
    await prisma.habilitaciones_personas.create({
      data: {
        habilitacion_id: habNueva.id,
        persona_id: personaId,
        rol: personaData.rol,  // TITULAR, CHOFER, CELADOR
      }
    })
  }
}
```

---

## 🎨 Ventajas

✅ **Flexible** → Cambia titular, chofer o celador por separado  
✅ **Buscar o crear** → Reutiliza existentes o crea nuevos  
✅ **Opcional** → Chofer y celador son opcionales  
✅ **Validación** → Titular siempre requerido  
✅ **UX clara** → Etiquetas con emojis  

---

## 📝 Pendientes

### **1. Actualizar API de renovación**
- Soportar array `personas` con roles
- Crear lógica para asociar múltiples personas
- Validar roles permitidos

### **2. Implementar "Cambio de Titular"**
- Modal completo para cambiar titular sin renovar
- Similar a "Cambio de Material"
- Registrar en historial

### **3. Ejecutar migraciones SQL**
```sql
-- Notificaciones
-- Renovación
-- Regenerar Prisma
```

---

## 🎉 Resultado Final

### **Menú Organizado:**
```
⋮ Opciones
  Ver Detalle
  Editar
  ───────────
  Ver Credencial
  Ver Resolución
  Descargar PDF
  ───────────
  🔄 Gestión  ►
    Renovar Habilitación
    Cambio de Titular (próximamente)
    Cambio de Material
    Gestionar Obleas
    Asignar Turno
  ───────────
  🤖 Consultar con IA
```

### **Renovación Completa:**
- Titular (obligatorio)
- Chofer (opcional)
- Celador (opcional)
- Vehículo

**¡Sistema de renovación completo y profesional!** 🚀
