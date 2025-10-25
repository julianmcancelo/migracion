# 🔍 Sistema de Filtros para Vehículos

## 🎯 Descripción

Sistema de filtros discreto y no invasivo que permite identificar rápidamente vehículos con problemas de documentación o datos faltantes.

---

## ✅ Implementado (100%)

### **1. Filtros Inteligentes** ✅
**3 Opciones de visualización:**
- 📊 **Todos** - Muestra todos los vehículos
- ⚠️ **Doc. Vencida** - Solo vehículos con VTV o Póliza vencida
- 📄 **Datos Faltantes** - Solo vehículos con información incompleta

### **2. Diseño No Invasivo** ✅
- Solo aparece si hay problemas
- Botones pequeños y discretos
- No molesta si todo está bien
- Contadores claros

### **3. Detección Automática** ✅
**Documenta Vencida:**
- ✅ VTV vencida (fecha < hoy)
- ✅ Póliza vencida (fecha < hoy)

**Datos Faltantes:**
- ✅ Sin marca
- ✅ Sin modelo
- ✅ Sin año
- ✅ Sin fecha VTV
- ✅ Sin fecha póliza

---

## 🎨 Interfaz

### **Sin Problemas (Filtros Ocultos):**
```
┌──────────────────────────────┐
│ 🔍 Buscar...      [Buscar]   │
└──────────────────────────────┘
```

### **Con Problemas (Filtros Visibles):**
```
┌──────────────────────────────────────┐
│ 🔍 Buscar...         [Buscar]        │
├──────────────────────────────────────┤
│ [Todos (150)] [⚠️ Doc. Vencida (5)]  │
│               [📄 Datos Faltantes (3)]│
└──────────────────────────────────────┘
```

### **Filtro Activo:**
```
┌──────────────────────────────────────┐
│ [Todos] [⚠️ Doc. Vencida (5)] ← ROJO │
│         [Datos Faltantes]            │
└──────────────────────────────────────┘

📊 Vehículos con documentación vencida: 5 de 150
[Ver todos]
```

---

## 🔄 Cómo Funciona

### **1. Carga Inicial:**
```
Sistema carga vehículos
    ↓
Analiza cada vehículo
    ↓
Cuenta problemas
    ↓
Si hay problemas → Muestra filtros
Si no hay → Oculta filtros (no molesta)
```

### **2. Usuario Selecciona Filtro:**
```
Click en "Doc. Vencida"
    ↓
Tabla muestra solo vehículos con documentación vencida
    ↓
Contador actualiza: "5 de 150"
    ↓
Botón activo se pone rojo
```

### **3. Volver a Ver Todos:**
```
Opción A: Click en "Todos"
Opción B: Click en "Ver todos" (en stats)
    ↓
Vuelve a mostrar todos los vehículos
```

---

## 📊 Lógica de Detección

### **Documentación Vencida:**
```typescript
const tieneProblemas = (vehiculo: Vehiculo) => {
  const hoy = new Date()
  const vtvVencida = vehiculo.Vencimiento_VTV 
    ? new Date(vehiculo.Vencimiento_VTV) < hoy 
    : false
  const polizaVencida = vehiculo.Vencimiento_Poliza 
    ? new Date(vehiculo.Vencimiento_Poliza) < hoy 
    : false
  return vtvVencida || polizaVencida
}
```

### **Datos Faltantes:**
```typescript
const tieneDatosFaltantes = (vehiculo: Vehiculo) => {
  return !vehiculo.marca || 
         !vehiculo.modelo || 
         !vehiculo.ano || 
         !vehiculo.Vencimiento_VTV || 
         !vehiculo.Vencimiento_Poliza
}
```

---

## 🎨 Estados Visuales

### **Botón "Todos":**
```
Normal: [Todos (150)]       ← Outline gris
Activo: [Todos (150)]       ← Azul sólido
```

### **Botón "Doc. Vencida":**
```
Normal: [⚠️ Doc. Vencida (5)]  ← Outline gris
Activo: [⚠️ Doc. Vencida (5)]  ← Rojo sólido
```

### **Botón "Datos Faltantes":**
```
Normal: [📄 Datos Faltantes (3)]  ← Outline gris
Activo: [📄 Datos Faltantes (3)]  ← Gris oscuro sólido
```

---

## 💡 Características "No Invasivas"

### **1. Solo Aparece Cuando es Necesario:**
```
✅ Si hay 0 problemas → Filtros ocultos
✅ Si hay 1+ problemas → Filtros visibles
```

### **2. Tamaño Discreto:**
```
✅ Botones pequeños (size="sm")
✅ Texto pequeño (text-xs)
✅ No ocupa mucho espacio
```

### **3. Contadores Informativos:**
```
✅ Muestra cantidad exacta
✅ Fácil de escanear
✅ Color según severidad
```

### **4. Fácil de Limpiar:**
```
✅ Click en "Todos"
✅ Click en "Ver todos"
✅ Vuelve al estado normal
```

---

## 📱 Responsive

### **Mobile:**
```
┌────────────────────────┐
│ [Todos (150)]          │
│ [⚠️ Doc. Venc... (5)]   │
│ [📄 Datos Falt... (3)]  │
└────────────────────────┘
```

### **Desktop:**
```
┌──────────────────────────────────────┐
│ [Todos (150)] [⚠️ Doc. Vencida (5)]  │
│               [📄 Datos Faltantes (3)]│
└──────────────────────────────────────┘
```

---

## 🎯 Casos de Uso

### **Caso 1: Mantenimiento Preventivo**
```
Admin entra a Vehículos
    ↓
Ve badge "⚠️ Doc. Vencida (5)"
    ↓
Click en el filtro
    ↓
Ve solo vehículos problemáticos
    ↓
Puede enviar notificaciones masivas
```

### **Caso 2: Completar Información**
```
Admin ve "📄 Datos Faltantes (10)"
    ↓
Filtra por datos faltantes
    ↓
Completa información uno por uno
    ↓
Contador disminuye
```

### **Caso 3: Auditoría**
```
Auditor revisa sistema
    ↓
Filtra por problemas
    ↓
Ve estado real de la flota
    ↓
Genera reporte de pendientes
```

---

## 📊 Métricas Mostradas

### **En Stats (Abajo de la Tabla):**

**Sin Filtro:**
```
📊 Total de vehículos: 150
```

**Con Filtro "Doc. Vencida":**
```
📊 Vehículos con documentación vencida: 5 de 150
[Ver todos]
```

**Con Filtro "Datos Faltantes":**
```
📊 Vehículos con datos faltantes: 10 de 150
[Ver todos]
```

---

## 🔄 Combinación con Búsqueda

### **Filtros + Búsqueda Funcionan Juntos:**
```
Búsqueda: "MERCEDES"
    +
Filtro: "Doc. Vencida"
    =
Solo Mercedes con documentación vencida
```

---

## ✅ Ventajas del Sistema

### **Para el Admin:**
- ✅ **Visibilidad** - Ve problemas al instante
- ✅ **Control** - Sabe cuántos vehículos requieren atención
- ✅ **Eficiencia** - Encuentra lo que necesita rápido
- ✅ **Proactividad** - Actúa antes que sea tarde

### **Para el Sistema:**
- ✅ **No invasivo** - Solo aparece cuando es útil
- ✅ **Performance** - Filtros en cliente, super rápido
- ✅ **UX** - Interfaz limpia y clara
- ✅ **Escalable** - Fácil agregar más filtros

---

## 🚀 Mejoras Futuras

### **Filtros Adicionales:**
```
1. VTV próxima a vencer (< 30 días)
2. Póliza próxima a vencer (< 30 días)
3. Sin habilitaciones activas
4. Vehículos antiguos (> X años)
5. Sin inspecciones recientes
```

### **Exportar Filtrados:**
```
Botón "Exportar" que descarga Excel/PDF
solo con vehículos del filtro activo
```

### **Notificaciones Masivas:**
```
Botón "Notificar a Todos"
que envía email a todos los vehículos
del filtro actual
```

---

## 📂 Archivos Modificados

**Frontend:**
- ✅ `app/(panel)/vehiculos/page.tsx` - Filtros y lógica

---

## 🎨 Ejemplo Real

### **Escenario:**
```
Fleet: 150 vehículos
- 5 con VTV vencida
- 3 con póliza vencida
- 2 con ambas vencidas
- 10 con datos incompletos
```

### **Interfaz:**
```
┌──────────────────────────────────────┐
│ 🔍 Buscar...         [Buscar]        │
├──────────────────────────────────────┤
│ [Todos (150)] [⚠️ Doc. Vencida (8)]  │
│               [📄 Datos Faltantes (10)]│
└──────────────────────────────────────┘

[Tabla con 150 vehículos]

📊 Total de vehículos: 150
```

### **Admin Click en "Doc. Vencida":**
```
┌──────────────────────────────────────┐
│ [Todos] [⚠️ Doc. Vencida (8)] ← ROJO │
│         [Datos Faltantes]            │
└──────────────────────────────────────┘

[Tabla con 8 vehículos problemáticos]

📊 Vehículos con documentación vencida: 8 de 150
[Ver todos]
```

---

## ✅ Estado Actual

**SISTEMA DE FILTROS: 100% FUNCIONAL** 🔍✨

- ✅ Detección automática de problemas
- ✅ Filtros discretos y no invasivos
- ✅ Contadores informativos
- ✅ Diseño responsive
- ✅ Combinable con búsqueda
- ✅ Fácil de usar

---

**¡Filtros listos y funcionando! Solo aparecen cuando son útiles.** 🎉
