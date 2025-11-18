# 🚗 Tipos de Transporte - Diferencias en Inspecciones

## 📋 Resumen

El sistema maneja **DOS tipos de transporte COMPLETAMENTE DISTINTOS**, cada uno con sus propias regulaciones y requisitos de inspección:

## 🚌 TRANSPORTE ESCOLAR

### Descripción
Vehículos destinados al **traslado de estudiantes** (niños y adolescentes) entre sus domicilios y establecimientos educativos.

### Características Principales
- **Pasajeros**: Menores de edad (estudiantes)
- **Tipo de vehículo**: Combis, micros, minibuses
- **Regulación**: Estricta por tratarse de menores
- **Identificación**: Obligatoria (pintura naranja y blanca)

### Requisitos Específicos (9 ítems adicionales)

#### 1. Puertas Accionadas por Conductor
- **Puerta derecha**: Accionada desde el puesto del conductor
- **Puerta izquierda**: Accionada desde el puesto del conductor
- **Objetivo**: Control total del conductor sobre ascenso/descenso

#### 2. Salidas de Emergencia
- Independientes de la plataforma de ascenso/descenso
- En combis: Lateral derecho y trasero
- **Objetivo**: Evacuación rápida en caso de emergencia

#### 3. Ventanas Especiales
- Vidrio templado o inastillable
- Apertura máxima de 10 cm
- **Objetivo**: Seguridad de los menores

#### 4. Pisos Antideslizantes
- Material antideslizante en todo el piso
- **Objetivo**: Prevenir caídas

#### 5. Banquetas Reglamentarias
- Altura desde el piso: 0.40 mts
- Ancho mínimo: 0.45 mts
- Profundidad (medida horizontal): 0.40 mts
- **Objetivo**: Ergonomía para niños

#### 6. Asientos Especiales
- Fijos (no removibles)
- Acolchados
- Estructura metálica
- Revestimiento de caucho o similar
- **Objetivo**: Seguridad y confort

#### 7. Pintura Reglamentaria
- **Carrocería baja y capot**: Naranja N° 1054 IRAM
- **Carrocería alta, techo y parantes**: Blanco
- **Objetivo**: Identificación visual inmediata

#### 8. Leyenda Obligatoria
- Texto: "ESCOLARES" o "NIÑOS"
- Tamaño mínimo: 0.20 mts
- **Objetivo**: Advertencia a otros conductores

### Total de Ítems a Inspeccionar
**18 ítems** = 9 comunes + 9 específicos

---

## 🚕 REMIS (Transporte de Pasajeros)

### Descripción
Servicio de **transporte de pasajeros con chofer**, similar a taxis pero con características propias del servicio de remis.

### Características Principales
- **Pasajeros**: Adultos y menores acompañados
- **Tipo de vehículo**: Autos sedán, SUV
- **Regulación**: Transporte público de pasajeros
- **Identificación**: No requiere pintura especial

### Requisitos Específicos (1 ítem adicional)

#### 1. Mampara Divisoria
- **Material**: Transparente
- **Ubicación**: Entre plazas delanteras y traseras
- **Objetivo**: Seguridad del conductor y pasajeros

### Total de Ítems a Inspeccionar
**10 ítems** = 9 comunes + 1 específico

---

## 🔄 Comparación Directa

| Aspecto | Transporte Escolar | Remis |
|---------|-------------------|-------|
| **Pasajeros** | Menores (estudiantes) | Adultos y menores acompañados |
| **Vehículo** | Combi, micro, minibus | Auto sedán, SUV |
| **Ítems comunes** | 9 | 9 |
| **Ítems específicos** | 9 | 1 |
| **Total ítems** | 18 | 10 |
| **Pintura especial** | ✅ Obligatoria (naranja/blanco) | ❌ No requerida |
| **Puertas especiales** | ✅ Accionadas por conductor | ❌ No requerido |
| **Salidas emergencia** | ✅ Obligatorias | ❌ No requerido |
| **Mampara divisoria** | ❌ No requerida | ✅ Obligatoria |
| **Banquetas especiales** | ✅ Dimensiones específicas | ❌ No requerido |
| **Leyenda identificatoria** | ✅ "ESCOLARES" o "NIÑOS" | ❌ No requerida |

---

## 📊 Ítems Comunes a Ambos Tipos

Estos 9 ítems se evalúan **SIEMPRE**, independientemente del tipo de transporte:

1. **Carrocería y Estructura**
   - Estado general de la carrocería exterior
   - Paragolpes, vidrios

2. **Seguridad Activa**
   - Espejos retrovisores (derecho e izquierdo)
   - Luces (posición, corta, larga, giros, balizas, stop, marcha atrás)
   - Cubiertas (banda de rodamiento y perfil)

3. **Interior y Confort**
   - Estado general del interior
   - Anclaje de butacas
   - Tapicería y paneles

4. **Seguridad Pasiva**
   - Cinturones de seguridad (todas las plazas)
   - Cabezales o apoya cabezas (todas las plazas)

5. **Equipamiento Obligatorio**
   - Matafuego reglamentario (fijado, con carga vigente)
   - Kit de emergencias para primeros auxilios

---

## 🎯 Lógica del Sistema

### En el Formulario de Inspección

```typescript
// El sistema determina qué ítems mostrar según el tipo
if (tipoTransporte === 'Escolar') {
  // Muestra: 9 comunes + 9 específicos de Escolar = 18 ítems
  items = [...commonItems, ...escolarItems];
} else if (tipoTransporte === 'Remis') {
  // Muestra: 9 comunes + 1 específico de Remis = 10 ítems
  items = [...commonItems, ...remisItems];
}
```

### Validación

- **Todos los ítems** mostrados deben ser calificados (Bien/Regular/Mal)
- Los ítems específicos de un tipo **NUNCA** aparecen en inspecciones del otro tipo
- No es posible "saltear" ítems - todos deben ser evaluados

---

## 📝 Ejemplos de Inspección

### Ejemplo 1: Transporte Escolar
```
Trámite: Licencia 2024-001-ESC
Tipo: Transporte Escolar
Vehículo: Mercedes Benz Sprinter

Ítems a evaluar:
✅ 9 ítems comunes
✅ 9 ítems específicos de Escolar
❌ NO se evalúa mampara divisoria (es de Remis)

Total: 18 ítems
```

### Ejemplo 2: Remis
```
Trámite: Licencia 2024-002-REM
Tipo: Remis
Vehículo: Chevrolet Cruze

Ítems a evaluar:
✅ 9 ítems comunes
✅ 1 ítem específico de Remis (mampara)
❌ NO se evalúan puertas especiales, pintura, etc. (son de Escolar)

Total: 10 ítems
```

---

## 🚨 Importante

### Para Inspectores

- **Verifique el tipo de transporte** antes de comenzar la inspección
- Los ítems mostrados en el formulario **ya están filtrados** según el tipo
- **No intente evaluar** ítems que no aparecen en el formulario
- Si tiene dudas sobre un ítem, use el campo de observaciones

### Para Desarrolladores

- El tipo de transporte se obtiene de `tramite.habilitacion.tipo_transporte`
- Los valores válidos son: `'Escolar'` o `'Remis'`
- La función `createInitialItems(tipoTransporte)` maneja la lógica automáticamente
- **No modificar** los arrays de ítems sin consultar la normativa vigente

---

## 📚 Referencias

- Normativa de Transporte Escolar: [Pendiente]
- Normativa de Remis: [Pendiente]
- Ordenanzas Municipales: [Pendiente]

---

**Última actualización:** 18 de Noviembre, 2024
