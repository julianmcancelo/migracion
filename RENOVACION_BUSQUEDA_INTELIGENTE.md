# 🔍 Renovación con Búsqueda Inteligente

## ✅ Implementado

### **Componentes Creados**

1. **`renovar-persona-selector.tsx`**
   - Buscar persona existente en la BD
   - O crear nueva persona
   - Tabs simples: [Buscar] [Crear]
   - Auto-búsqueda mientras escribes
   - Muestra hasta 5 resultados

2. **`renovar-vehiculo-selector.tsx`**
   - Buscar vehículo existente por dominio
   - O crear nuevo vehículo
   - Tabs simples: [Buscar] [Crear]
   - Auto-búsqueda mientras escribes

3. **`modal-renovar.tsx`** (Actualizado)
   - Integra los selectores inteligentes
   - Checkboxes para elegir qué copiar
   - Validación automática

---

## 🎯 Cómo Funciona

### **Caso 1: Mantener Titular (Default)**
```
☑️ Mantener mismo titular
```
→ No muestra nada, copia del año anterior

---

### **Caso 2: Cambiar Titular**
```
☐ Mantener mismo titular

┌─────────────────────────────────────┐
│ [Buscar Existente] [Crear Nuevo]   │
├─────────────────────────────────────┤
│ 🔍 Buscar por nombre o DNI...      │
│                                     │
│ Resultados:                         │
│ • García, Juan (DNI: 12345678)     │
│ • García, María (DNI: 87654321)    │
└─────────────────────────────────────┘
```

**Al seleccionar uno existente:**
```
✅ García, Juan
   DNI: 12345678
   [Cambiar]
```

**O crear nuevo:**
```
Nombre *     [_______________]
Apellido *   [_______________]
DNI *        [_______________]
Domicilio    [_______________]
Teléfono     [_______________]
Email        [_______________]
```

---

### **Caso 3: Cambiar Vehículo**
```
☐ Mantener mismo vehículo

┌─────────────────────────────────────┐
│ [Buscar Existente] [Crear Nuevo]   │
├─────────────────────────────────────┤
│ 🔍 Buscar por dominio...           │
│                                     │
│ Resultados:                         │
│ • ABC123 (Ford Transit 2020)       │
│ • ABC124 (Mercedes Sprinter)       │
└─────────────────────────────────────┘
```

---

## 🎨 Experiencia de Usuario

1. **Default: Todo marcado** → Renovar rápido (solo expediente)
2. **Buscar existente** → Escribe 2-3 letras y aparecen resultados
3. **Crear nuevo** → Formulario simple con campos necesarios
4. **Validación automática** → No deja avanzar si faltan datos

---

## 📋 Requisitos de API

Los selectores esperan estas APIs:

### **GET** `/api/personas?buscar=Juan&limite=5`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Juan",
      "apellido": "García",
      "dni": "12345678",
      "domicilio": "Calle 123",
      "telefono": "1234567890",
      "email": "juan@example.com"
    }
  ]
}
```

### **GET** `/api/vehiculos?buscar=ABC&limite=5`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "dominio": "ABC123",
      "marca": "Ford",
      "modelo": "Transit",
      "anio": 2020,
      "tipo": "Minibus"
    }
  ]
}
```

---

## ⚙️ Comportamiento de la API de Renovación

La API (`/api/habilitaciones/[id]/renovar`) recibe:

### **Si se selecciona persona existente:**
```json
{
  "nuevoExpediente": "EXP-2025-0123",
  "copiarTitular": false,
  "nuevoTitular": {
    "id": 1,  // <-- Tiene ID = usar existente
    "nombre": "Juan",
    "apellido": "García",
    "dni": "12345678"
  }
}
```
→ La API asocia la persona existente (ID=1) a la nueva habilitación

### **Si se crea persona nueva:**
```json
{
  "nuevoExpediente": "EXP-2025-0123",
  "copiarTitular": false,
  "nuevoTitular": {
    // <-- NO tiene ID = crear nueva
    "nombre": "María",
    "apellido": "López",
    "dni": "87654321",
    "domicilio": "Av. Principal 456"
  }
}
```
→ La API crea nueva persona y la asocia

---

## 🔧 Pendientes

### **1. Crear API de búsqueda de personas** (si no existe)
```typescript
// app/api/personas/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const buscar = searchParams.get('buscar') || ''
  const limite = parseInt(searchParams.get('limite') || '10')

  const personas = await prisma.personas.findMany({
    where: {
      OR: [
        { nombre: { contains: buscar } },
        { apellido: { contains: buscar } },
        { dni: { contains: buscar } },
      ],
    },
    take: limite,
  })

  return NextResponse.json({ success: true, data: personas })
}
```

### **2. Crear API de búsqueda de vehículos** (si no existe)
```typescript
// app/api/vehiculos/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const buscar = searchParams.get('buscar') || ''
  const limite = parseInt(searchParams.get('limite') || '10')

  const vehiculos = await prisma.vehiculos.findMany({
    where: {
      dominio: { contains: buscar },
    },
    take: limite,
  })

  return NextResponse.json({ success: true, data: vehiculos })
}
```

### **3. Actualizar API de renovación**
Modificar para que detecte si `nuevoTitular` o `nuevoVehiculo` tienen `id`:
- **Si tiene ID** → Asociar existente
- **Si NO tiene ID** → Crear nuevo

---

## 🎉 Ventajas

✅ **Reutiliza datos** → No duplicar personas/vehículos  
✅ **Búsqueda rápida** → Encuentra en 2-3 letras  
✅ **Flexible** → Crear nuevo si no existe  
✅ **UX familiar** → Como en el resto del sistema  
✅ **Validación automática** → Evita errores  

---

## 🚀 Resultado Final

El usuario puede renovar una habilitación en 3 clicks:
1. Click "Renovar"
2. Escribe expediente
3. Click "✅ Renovar"

O si necesita cambiar datos:
1. Desmarca checkbox
2. Busca o crea nuevo
3. Click "✅ Renovar"

**¡Simple y poderoso!** 🎯
