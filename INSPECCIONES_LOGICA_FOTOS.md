# 📸 Lógica de Evidencia Fotográfica

## 🎯 Reglas Generales

El sistema implementa una **lógica inteligente** para la captura de fotos según el estado de cada ítem inspeccionado.

---

## 📋 Paso 1: Verificación de Ítems

### Estados Posibles

Cada ítem puede ser calificado como:
- ✅ **Bien**
- ⚠️ **Regular**
- ❌ **Mal**

### Lógica de Evidencia por Estado

#### ✅ Estado: BIEN

**Foto:** ❌ NO se muestra opción de foto
**Observación:** ❌ NO se muestra campo de observación
**Justificación:** Si está bien, no hay nada que documentar

```typescript
if (item.estado === 'bien') {
  // No mostrar campos de foto ni observación
  // El ítem está OK, no requiere evidencia
}
```

#### ⚠️ Estado: REGULAR

**Foto:** ✅ OBLIGATORIA
**Observación:** 📝 Opcional (recomendada)
**Justificación:** Debe documentar qué está en estado regular

**Mensaje al inspector:**
```
⚠️ Evidencia Fotográfica Obligatoria
Foto del problema (regular)
* Debe tomar una foto para justificar el estado
```

**Validación:**
- No permite avanzar al siguiente paso sin la foto
- Muestra mensaje de error si intenta continuar sin foto

#### ❌ Estado: MAL

**Foto:** ✅ OBLIGATORIA
**Observación:** ✅ OBLIGATORIA
**Justificación:** Debe documentar detalladamente el problema

**Mensaje al inspector:**
```
❌ Evidencia Fotográfica Obligatoria
Foto del problema (mal)
Observación obligatoria - Describa el problema...
* Debe tomar una foto para justificar el estado
```

**Validación:**
- No permite avanzar sin foto
- Requiere descripción del problema en observaciones

---

## 🚗 Paso 2: Evidencia Fotográfica del Vehículo

### Todas las Fotos son OPCIONALES

A diferencia del Paso 1, **TODAS** las fotos del vehículo son opcionales:

#### Fotos Disponibles
1. **Frente del Vehículo** - Opcional
2. **Parte Trasera** - Opcional
3. **Lateral Izquierdo** - Opcional
4. **Lateral Derecho** - Opcional
5. **Foto Adicional** - Opcional

#### Mensaje Informativo
```
ℹ️ Evidencia Fotográfica: Las fotos del vehículo son opcionales.
Tome fotos si considera necesario documentar el estado general del vehículo.
```

#### Cuándo Tomar Estas Fotos

**Tome fotos del vehículo si:**
- Quiere documentar el estado general
- Hay daños visibles en la carrocería
- Necesita contexto adicional para la inspección
- El contribuyente lo solicita

**NO es necesario si:**
- Todos los ítems están en "Bien"
- Ya tomó fotos específicas en el Paso 1
- El vehículo está en buen estado general

---

## 🔍 Ejemplos Prácticos

### Ejemplo 1: Inspección con Todo Bien

```
Paso 1 - Verificación de Ítems:
✅ Carrocería: Bien → Sin foto
✅ Espejos: Bien → Sin foto
✅ Luces: Bien → Sin foto
✅ Cubiertas: Bien → Sin foto
... (todos los ítems en Bien)

Paso 2 - Evidencia del Vehículo:
📷 Fotos opcionales: 0 tomadas
Resultado: Puede continuar sin problemas
```

### Ejemplo 2: Inspección con Problemas Menores

```
Paso 1 - Verificación de Ítems:
✅ Carrocería: Bien → Sin foto
⚠️ Espejos: Regular → FOTO OBLIGATORIA ✓
✅ Luces: Bien → Sin foto
⚠️ Cubiertas: Regular → FOTO OBLIGATORIA ✓
... (resto en Bien)

Paso 2 - Evidencia del Vehículo:
📷 Fotos opcionales: 2 tomadas (frente y lateral)
Resultado: 2 fotos obligatorias + 2 opcionales = 4 fotos totales
```

### Ejemplo 3: Inspección con Problemas Graves

```
Paso 1 - Verificación de Ítems:
⚠️ Carrocería: Regular → FOTO OBLIGATORIA ✓
❌ Espejos: Mal → FOTO OBLIGATORIA ✓ + OBSERVACIÓN ✓
✅ Luces: Bien → Sin foto
❌ Cubiertas: Mal → FOTO OBLIGATORIA ✓ + OBSERVACIÓN ✓
... (resto en Bien)

Paso 2 - Evidencia del Vehículo:
📷 Fotos opcionales: 4 tomadas (todas las vistas)
Resultado: 3 fotos obligatorias + 4 opcionales = 7 fotos totales
```

---

## ⚠️ Validaciones Implementadas

### Al Intentar Avanzar del Paso 1

El sistema verifica:

1. **Todos los ítems tienen estado asignado**
   ```
   ❌ Error: "Por favor, califique todos los ítems antes de continuar"
   ```

2. **Ítems Regular/Mal tienen foto**
   ```
   ❌ Error: "Debe tomar fotos de los X ítem(s) calificados como 
   Regular o Mal para justificar el estado"
   ```

### Código de Validación

```typescript
const canGoNext = () => {
  if (currentStep === 0) {
    // Verificar estados
    const allHaveState = items.every((item) => item.estado !== null);
    
    // Verificar fotos obligatorias
    const regularOrMalWithPhoto = items
      .filter((item) => item.estado === 'regular' || item.estado === 'mal')
      .every((item) => item.foto !== null && item.foto !== '');
    
    return allHaveState && regularOrMalWithPhoto;
  }
  return true;
};
```

---

## 📊 Estadísticas de Fotos

El sistema puede generar estadísticas de cuántas fotos se tomaron:

```typescript
// Fotos obligatorias (ítems Regular/Mal)
const fotosObligatorias = items.filter(
  (item) => 
    (item.estado === 'regular' || item.estado === 'mal') && 
    item.foto
).length;

// Fotos opcionales del vehículo
const fotosOpcionales = Object.values(vehiclePhotos).filter(
  (foto) => foto !== ''
).length;

// Total
const totalFotos = fotosObligatorias + fotosOpcionales;
```

---

## 💡 Mejores Prácticas para Inspectores

### ✅ Recomendaciones

1. **Tome fotos claras y enfocadas**
   - Asegúrese de que el problema sea visible
   - Use buena iluminación
   - Evite fotos borrosas

2. **Agregue observaciones detalladas**
   - Describa exactamente qué está mal
   - Incluya medidas si es necesario
   - Sea específico y claro

3. **Use las fotos del vehículo estratégicamente**
   - Tome vistas generales si hay múltiples problemas
   - Documente el contexto cuando sea relevante
   - No es necesario si todo está bien

### ❌ Evite

1. **No tome fotos innecesarias**
   - Si está en "Bien", no hay que documentar
   - Las fotos del vehículo son opcionales

2. **No omita fotos obligatorias**
   - El sistema no le permitirá avanzar
   - Es un requisito para Regular/Mal

3. **No use fotos genéricas**
   - Cada foto debe mostrar el problema específico
   - Evite fotos que no aporten información

---

## 🎯 Resumen Visual

```
┌─────────────────────────────────────────────────────────┐
│                    PASO 1: ÍTEMS                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Estado: BIEN      →  ❌ Sin foto                       │
│                       ❌ Sin observación                │
│                                                         │
│  Estado: REGULAR   →  ✅ Foto OBLIGATORIA              │
│                       📝 Observación opcional          │
│                                                         │
│  Estado: MAL       →  ✅ Foto OBLIGATORIA              │
│                       ✅ Observación OBLIGATORIA       │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              PASO 2: FOTOS DEL VEHÍCULO                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📷 Frente          →  Opcional                         │
│  📷 Trasera         →  Opcional                         │
│  📷 Lateral Izq.    →  Opcional                         │
│  📷 Lateral Der.    →  Opcional                         │
│  📷 Adicional       →  Opcional                         │
│                                                         │
│  ℹ️ Tome fotos solo si considera necesario             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Última actualización:** 18 de Noviembre, 2024

**Versión:** 2.0 - Con lógica inteligente de evidencia fotográfica
